import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { log } from '../utils/helpers';

const ProfileInformation = () => {
  const [formData, setFormData] = useState({
    // Text inputs
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Select and multi-select
    country: '',
    skills: [],

    // Radio buttons
    experience: '',

    // Checkboxes
    interests: [],
    newsletter: false,
    terms: false,

    // Other inputs
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

    // Simulate API call
    setTimeout(() => {
      log('Form submitted:', formData);
      toast.success('Form submitted successfully!');
      setSubmitLoading(false);
    }, 1500);
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
    <div className="page-profile-forms max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="page-profile-forms__form space-y-8">
        {/* Personal Information */}
        <div className="page-profile-forms__card card">
          <h3 className="page-profile-forms__section-title text-lg font-medium text-gray-900 dark:text-white mb-6">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="page-profile-forms__label form-label">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="page-profile-forms__input form-input"
                value={formData.firstName}
                onChange={handleInputChange}
                data-testid="first-name-input"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="page-profile-forms__label form-label">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="page-profile-forms__input form-input"
                value={formData.lastName}
                onChange={handleInputChange}
                data-testid="last-name-input"
              />
            </div>

            <div>
              <label htmlFor="email" className="page-profile-forms__label form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="page-profile-forms__input form-input"
                value={formData.email}
                onChange={handleInputChange}
                data-testid="email-input"
              />
            </div>

            <div>
              <label htmlFor="phone" className="page-profile-forms__label form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="page-profile-forms__input form-input"
                value={formData.phone}
                onChange={handleInputChange}
                data-testid="phone-input"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="page-profile-forms__label form-label">
                Date of Birth
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                className="page-profile-forms__input form-input"
                value={formData.birthDate}
                onChange={handleInputChange}
                data-testid="birth-date-input"
              />
            </div>

            <div>
              <label htmlFor="country" className="page-profile-forms__label form-label">
                Country
              </label>
              <select
                id="country"
                name="country"
                className="page-profile-forms__select form-input"
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
        <div className="page-profile-forms__card card">
          <h3 className="page-profile-forms__section-title text-lg font-medium text-gray-900 dark:text-white mb-6">
            Professional Information
          </h3>

          {/* Experience Level - Radio buttons */}
          <div className="mb-6">
            <label className="page-profile-forms__label form-label">Experience Level *</label>
            <div className="space-y-2">
              {['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].map(level => (
                <label key={level} className="page-profile-forms__radio-row flex items-center">
                  <input
                    type="radio"
                    name="experience"
                    value={level}
                    checked={formData.experience === level}
                    onChange={handleInputChange}
                    className="page-profile-forms__radio w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
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
            <label htmlFor="skills" className="form-label">
              Technical Skills (Hold Ctrl/Cmd to select multiple)
            </label>
            <select
              id="skills"
              name="skills"
              multiple
              className="page-profile-forms__select form-input"
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
            <label htmlFor="portfolio" className="page-profile-forms__label form-label">
              Portfolio URL
            </label>
            <input
              type="url"
              id="portfolio"
              name="portfolio"
              className="page-profile-forms__input form-input"
              placeholder="https://your-portfolio.com"
              value={formData.portfolio}
              onChange={handleInputChange}
              data-testid="portfolio-input"
            />
          </div>

          {/* Bio - Textarea */}
          <div>
            <label htmlFor="bio" className="page-profile-forms__label form-label">
              Professional Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="page-profile-forms__textarea form-input"
              placeholder="Tell us about your professional background..."
              value={formData.bio}
              onChange={handleInputChange}
              data-testid="bio-textarea"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="page-profile-forms__card card">
          <h3 className="page-profile-forms__section-title text-lg font-medium text-gray-900 dark:text-white mb-6">
            Preferences & Interests
          </h3>

          {/* Areas of Interest - Checkboxes */}
          <div className="mb-6">
            <label className="page-profile-forms__label form-label">Areas of Interest</label>
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
            <label htmlFor="priority" className="page-profile-forms__label form-label">
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              className="page-profile-forms__select form-input"
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
            className="page-profile-forms__reset-btn btn-secondary"
            data-testid="reset-form-btn"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={submitLoading}
            className="page-profile-forms__submit-btn btn-primary"
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
    </div>
  );
};

export default ProfileInformation;
