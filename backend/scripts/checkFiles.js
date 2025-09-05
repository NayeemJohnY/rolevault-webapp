const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const File = require('../models/File');
const { log } = require('../utils/logger');

function resolveFilePath(storedPath, filename) {
    const candidates = [
        storedPath,
        path.join(__dirname, '..', storedPath || ''),
        path.join(process.cwd(), storedPath || ''),
        path.join(process.cwd(), 'backend', 'uploads', filename || ''),
        path.join(process.cwd(), 'uploads', filename || '')
    ];

    return candidates.find(p => p && fs.existsSync(p));
}

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not set in .env');
        process.exit(1);
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    log('Connected to MongoDB');

    const files = await File.find({}).select('originalName filename path uploadedBy createdAt');
    const report = [];

    for (const f of files) {
        const exists = fs.existsSync(f.path);
        const resolved = resolveFilePath(f.path, f.filename);

        report.push({
            id: f._id.toString(),
            originalName: f.originalName,
            filename: f.filename,
            storedPath: f.path,
            exists: !!exists,
            resolvedPath: resolved || null,
            uploadedBy: f.uploadedBy,
            createdAt: f.createdAt
        });
    }

    // Print report
    console.table(report.map(r => ({
        id: r.id,
        originalName: r.originalName,
        filename: r.filename,
        storedPath: r.storedPath,
        exists: r.exists,
        resolvedPath: r.resolvedPath
    })));

    // If --fix provided, update DB paths to resolvedPath when present
    const shouldFix = process.argv.includes('--fix');
    if (shouldFix) {
        for (const r of report) {
            if (!r.exists && r.resolvedPath) {
                log(`Updating DB for ${r.id} -> ${r.resolvedPath}`);
                await File.findByIdAndUpdate(r.id, { path: r.resolvedPath });
            }
        }
        log('DB fixes applied where possible');
    }

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
