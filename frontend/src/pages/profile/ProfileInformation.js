import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const ProfileInformation = () => {
    const { updateProfile, user } = useAuth();
    // Avatar upload state
    // Initialize avatarPreview from user.profileImage if available
    const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || null);
    const avatarInputRef = useRef();
    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

    // Avatar upload handler
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                setAvatarPreview(reader.result);
                // Immediately upload avatar to backend
                try {
                    const result = await updateProfile({ profileImage: reader.result });
                    if (result.success) {
                        toast.success('Profile photo updated!');
                    } else {
                        toast.error(result.error || 'Profile photo update failed');
                    }
                } catch (err) {
                    toast.error('Profile photo update failed');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Keep avatarPreview in sync if user.profileImage changes (e.g., from other parts of the app)
    React.useEffect(() => {
        setAvatarPreview(user?.profileImage || null);
    }, [user?.profileImage]);

    // Initialize form with current user data when user is available
    React.useEffect(() => {
        if (!user) return;

        const name = user.name || '';
        const hasFirst = user.firstName || false;
        let firstName = '';
        let lastName = '';
        if (hasFirst) {
            firstName = user.firstName || '';
            lastName = user.lastName || '';
        } else if (name) {
            const parts = name.split(' ');
            firstName = parts.shift() || '';
            lastName = parts.join(' ') || '';
        }

        setFormData(prev => ({
            ...prev,
            firstName,
            lastName,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
            country: user.country || prev.country,
            skills: user.skills || prev.skills,
            experience: user.experience || prev.experience,
            interests: user.interests || prev.interests,
            newsletter: user.newsletter || prev.newsletter,
            birthDate: user.birthDate || prev.birthDate,
            portfolio: user.portfolio || prev.portfolio,
            bio: user.bio || prev.bio,
            priority: user.priority || prev.priority
        }));
    }, [user]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        skills: [],
        experience: '',
        interests: [],
        newsletter: false,
        terms: false,
        birthDate: '',
        portfolio: '',
        bio: '',
        priority: 'medium'
    });

    const [submitLoading, setSubmitLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'interests') {
                setFormData(prev => ({
                    ...prev,
                    interests: checked
                        ? [...prev.interests, value]
                        : prev.interests.filter(item => item !== value)
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: checked
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const values = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        setFormData(prev => ({
            ...prev,
            [name]: values
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            // Send profileImage as base64 string if available
            const payload = {
                ...formData,
                profileImage: avatarPreview || user?.profileImage || null
            };
            const result = await updateProfile(payload);
            if (result.success) {
                toast.success('Profile updated successfully!');
            } else {
                toast.error(result.error || 'Profile update failed');
            }
        } catch (err) {
            toast.error('Profile update failed');
        }
        setSubmitLoading(false);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            country: '',
            skills: [],
            experience: '',
            interests: [],
            newsletter: false,
            terms: false,
            birthDate: '',
            portfolio: '',
            bio: '',
            priority: 'medium'
        });
        toast.success('Form reset successfully!');
    };

    const countries = [
        'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
        'Australia', 'Japan', 'India', 'Brazil', 'Other'
    ];

    const skillOptions = [
        'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB',
        'AWS', 'Docker', 'Git', 'TypeScript'
    ];

    const interestOptions = [
        'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
        'DevOps', 'UI/UX Design', 'Cybersecurity', 'Blockchain'
    ];

    return (
        <div className="page-profile-information max-w-4xl mx-auto p-6">
            <h1 className="page-profile-information__title text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h1>
            {/* Avatar/Profile Photo Upload */}
            <div className="page-profile-information__avatar card mb-8 flex flex-col items-center justify-center">
                <h3 className="page-profile-information__avatar-title text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Photo</h3>
                <div className="mb-4">
                    <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                    />
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="page-profile-information__upload-btn btn-primary"
                            onClick={() => avatarInputRef.current.click()}
                            data-testid="upload-photo-btn"
                        >
                            {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                        </button>

                        {avatarPreview && (
                            <button
                                type="button"
                                className="page-profile-information__remove-btn btn-ghost text-sm text-red-600 dark:text-red-400"
                                onClick={async () => {
                                    setConfirmDialog({
                                        open: true,
                                        title: 'Remove Profile Photo',
                                        message: 'Remove profile photo?',
                                        onConfirm: async () => {
                                            setConfirmDialog({ ...confirmDialog, open: false });
                                            try {
                                                const result = await updateProfile({ profileImage: null });
                                                if (result.success) {
                                                    setAvatarPreview(null);
                                                    // clear file input
                                                    if (avatarInputRef.current) avatarInputRef.current.value = null;
                                                    toast.success('Profile photo removed');
                                                } else {
                                                    toast.error(result.error || 'Failed to remove profile photo');
                                                }
                                            } catch (err) {
                                                toast.error('Failed to remove profile photo');
                                            }
                                        }
                                    });
                                }}
                                data-testid="remove-photo-btn"
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                </div>
                {avatarPreview && (
                    <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="page-profile-information__avatar-img rounded-full w-32 h-32 object-cover border-2 border-primary-500"
                    />
                )}
            </div>
            <form onSubmit={handleSubmit} className="page-profile-information__form space-y-8">
                {/* Personal Information */}
                <div className="page-profile-information__card card">
                    <h3 className="page-profile-information__section-title text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstName" className="page-profile-information__label form-label">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                className="page-profile-information__input form-input"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                data-testid="first-name-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="form-label">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                className="form-input"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                data-testid="last-name-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="form-label">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="form-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled
                                data-testid="email-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="form-label">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleInputChange}
                                data-testid="phone-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="birthDate" className="form-label">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                id="birthDate"
                                name="birthDate"
                                className="form-input"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                data-testid="birth-date-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="form-label">
                                Country
                            </label>
                            <select
                                id="country"
                                name="country"
                                className="form-input"
                                value={formData.country}
                                onChange={handleInputChange}
                                data-testid="country-select"
                            >
                                <option value="">Select a country</option>
                                {countries.map(country => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                {/* Professional Information */}
                <div className="page-profile-information__card card">
                    <h3 className="page-profile-information__section-title text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Professional Information
                    </h3>
                    {/* Experience Level - Radio buttons */}
                    <div className="mb-6">
                        <label className="form-label">Experience Level *</label>
                        <div className="space-y-2">
                            {['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].map(level => (
                                <label key={level} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="experience"
                                        value={level}
                                        checked={formData.experience === level}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                        data-testid={`experience-${level.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        {level}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Skills - Multi-select */}
                    <div className="mb-6">
                        <label htmlFor="skills" className="page-profile-information__label form-label">
                            Technical Skills (Hold Ctrl/Cmd to select multiple)
                        </label>
                        <select
                            id="skills"
                            name="skills"
                            multiple
                            className="page-profile-information__select form-input"
                            value={formData.skills}
                            onChange={handleMultiSelectChange}
                            data-testid="skills-select"
                        >
                            {skillOptions.map(skill => (
                                <option key={skill} value={skill}>
                                    {skill}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Selected: {formData.skills.join(', ') || 'None'}
                        </p>
                    </div>
                    {/* Portfolio URL */}
                    <div className="mb-6">
                        <label htmlFor="portfolio" className="form-label">
                            Portfolio URL
                        </label>
                        <input
                            type="url"
                            id="portfolio"
                            name="portfolio"
                            className="form-input"
                            placeholder="https://your-portfolio.com"
                            value={formData.portfolio}
                            onChange={handleInputChange}
                            data-testid="portfolio-input"
                        />
                    </div>
                    {/* Bio - Textarea */}
                    <div>
                        <label htmlFor="bio" className="form-label">
                            Professional Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            className="form-input"
                            placeholder="Tell us about your professional background..."
                            value={formData.bio}
                            onChange={handleInputChange}
                            data-testid="bio-textarea"
                        />
                    </div>
                </div>
                {/* Preferences */}
                <div className="page-profile-information__card card">
                    <h3 className="page-profile-information__section-title text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Preferences & Interests
                    </h3>
                    {/* Areas of Interest - Checkboxes */}
                    <div className="mb-6">
                        <label className="form-label">Areas of Interest</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {interestOptions.map(interest => (
                                <label key={interest} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="interests"
                                        value={interest}
                                        checked={formData.interests.includes(interest)}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        data-testid={`interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        {interest}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Priority Level */}
                    <div className="mb-6">
                        <label htmlFor="priority" className="form-label">
                            Priority Level
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            className="form-input"
                            value={formData.priority}
                            onChange={handleInputChange}
                            data-testid="priority-select"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    {/* Newsletter Subscription */}
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="newsletter"
                                checked={formData.newsletter}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                data-testid="newsletter-checkbox"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Subscribe to our newsletter for updates and tips
                            </span>
                        </label>
                    </div>
                    {/* Terms and Conditions */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="terms"
                                checked={formData.terms}
                                onChange={handleInputChange}
                                required
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                data-testid="terms-checkbox"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                I agree to the Terms and Conditions *
                            </span>
                        </label>
                    </div>
                </div>
                {/* Form Actions */}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="page-profile-information__reset-btn btn-secondary"
                        data-testid="reset-form-btn"
                    >
                        Reset Form
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="page-profile-information__submit-btn btn-primary"
                        data-testid="submit-form-btn"
                    >
                        {submitLoading ? 'Submitting...' : 'Submit Form'}
                    </button>
                </div>
            </form>
            {/* Form Data Preview */}
            <div className="mt-8 card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Form Data Preview
                </h3>
                <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                    {JSON.stringify(formData, null, 2)}
                </pre>
            </div>
            <ConfirmDialog
                isOpen={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
            />
        </div>
    );
};

export default ProfileInformation;
