const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: function (req, file, cb) {
    // Allow most common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: images, documents, archives'));
    }
  }
});

// Upload file
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { description = '', tags = '', isPublic = false } = req.body;
    
    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Create file record
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user._id,
      description,
      tags: parsedTags,
      isPublic: isPublic === 'true'
    });

    await file.save();
    await file.populate('uploadedBy', 'name email');

    res.status(201).json({
      message: 'File uploaded successfully',
      file
    });
  } catch (error) {
    // Clean up file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get files (user's own files or public files)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, isPublic } = req.query;
    
    // Build filter
    const filter = {
      $or: [
        { uploadedBy: req.user._id }, // User's own files
        { isPublic: true } // Public files
      ]
    };

    if (search) {
      filter.$and = [
        filter,
        {
          $or: [
            { originalName: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }
      ];
    }

    if (type) {
      filter.mimetype = { $regex: type, $options: 'i' };
    }

    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }

    const files = await File.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(filter);

    res.json({
      files,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Get file by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      $or: [
        { uploadedBy: req.user._id },
        { isPublic: true }
      ]
    }).populate('uploadedBy', 'name email');
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file' });
  }
});

// Download file
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      $or: [
        { uploadedBy: req.user._id },
        { isPublic: true }
      ]
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
});

// Update file metadata
router.put('/:id', 
  authenticate, 
  validate(schemas.fileUpdate), 
  async (req, res) => {
    try {
      const file = await File.findOne({
        _id: req.params.id,
        uploadedBy: req.user._id
      });

      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }

      const { description, tags, isPublic } = req.body;
      
      if (description !== undefined) file.description = description;
      if (tags !== undefined) file.tags = tags;
      if (isPublic !== undefined) file.isPublic = isPublic;

      await file.save();
      await file.populate('uploadedBy', 'name email');

      res.json({
        message: 'File updated successfully',
        file
      });
    } catch (error) {
      console.error('Error updating file:', error);
      res.status(500).json({ message: 'Error updating file' });
    }
  }
);

// Delete file
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found or access denied' });
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file record
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Get user's file statistics
router.get('/stats/user', authenticate, async (req, res) => {
  try {
    const stats = await File.aggregate([
      { $match: { uploadedBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' },
          publicFiles: { $sum: { $cond: ['$isPublic', 1, 0] } }
        }
      }
    ]);

    const recentFiles = await File.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName createdAt size downloadCount');

    res.json({
      stats: stats[0] || { totalFiles: 0, totalSize: 0, totalDownloads: 0, publicFiles: 0 },
      recentFiles
    });
  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({ message: 'Error fetching file statistics' });
  }
});

module.exports = router;
