import React, { useState, ChangeEvent } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

export default function BusinessProfileStep() {
  const { onboardingData, updateBusinessProfile } = useOnboarding();
  const { businessProfile } = onboardingData;

  const [logoPreview, setLogoPreview] = useState<string | null>(businessProfile.logoUrl || null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof typeof businessProfile, value: string) => {
    updateBusinessProfile({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, logo: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: 'Image size must be less than 2MB' }));
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      updateBusinessProfile({ logoUrl: result });
      setErrors((prev) => ({ ...prev, logo: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateBusinessProfile({ logoUrl: '' });
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;

    const [, area, prefix, line] = match;
    if (line) {
      return `(${area}) ${prefix}-${line}`;
    } else if (prefix) {
      return `(${area}) ${prefix}`;
    } else if (area) {
      return `(${area}`;
    }
    return '';
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Business Profile</h2>
        <p>Tell us about your auto shop</p>
      </div>

      <div className="step-content">
        {/* Business Name */}
        <div className="form-group">
          <label htmlFor="businessName">
            Business Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="businessName"
            value={businessProfile.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="e.g., Caleb's Auto Repair"
            className={errors.businessName ? 'error' : ''}
          />
          {errors.businessName && <span className="error-message">{errors.businessName}</span>}
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address">
            Street Address <span className="required">*</span>
          </label>
          <input
            type="text"
            id="address"
            value={businessProfile.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="e.g., 123 Main Street"
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        {/* City, State, Zip */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              id="city"
              value={businessProfile.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="e.g., Springfield"
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="state">
              State <span className="required">*</span>
            </label>
            <input
              type="text"
              id="state"
              value={businessProfile.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="e.g., IL"
              maxLength={2}
              className={errors.state ? 'error' : ''}
            />
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="zipCode">
              ZIP Code <span className="required">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              value={businessProfile.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="e.g., 62701"
              maxLength={10}
              className={errors.zipCode ? 'error' : ''}
            />
            {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
          </div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={businessProfile.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 123-4567"
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        {/* Email (optional) */}
        <div className="form-group">
          <label htmlFor="email">Business Email (optional)</label>
          <input
            type="email"
            id="email"
            value={businessProfile.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="e.g., info@calebauto.com"
          />
        </div>

        {/* Logo Upload */}
        <div className="form-group">
          <label>Business Logo (optional)</label>
          <div className="logo-upload-container">
            {logoPreview ? (
              <div className="logo-preview">
                <img src={logoPreview} alt="Business logo preview" />
                <button type="button" onClick={handleRemoveLogo} className="remove-logo-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Remove
                </button>
              </div>
            ) : (
              <label htmlFor="logoUpload" className="logo-upload-label">
                <div className="upload-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p>Click to upload logo</p>
                  <span>PNG, JPG up to 2MB</span>
                </div>
                <input
                  type="file"
                  id="logoUpload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          {errors.logo && <span className="error-message">{errors.logo}</span>}
        </div>
      </div>
    </div>
  );
}
