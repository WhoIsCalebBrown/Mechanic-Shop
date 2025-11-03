import { useState, useEffect, type ChangeEvent } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

// US States
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

// Canadian Provinces
const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'NS', name: 'Nova Scotia' },
  { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' },
  { code: 'NT', name: 'Northwest Territories' }, { code: 'NU', name: 'Nunavut' },
  { code: 'YT', name: 'Yukon' }
];

export default function BusinessProfileStep() {
  const { onboardingData, updateBusinessProfile } = useOnboarding();
  const { businessProfile } = onboardingData;

  const [country, setCountry] = useState<'US' | 'CA'>('US');
  const [logoPreview, setLogoPreview] = useState<string | null>(businessProfile.logoUrl || null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-detect country from state if already filled
  useEffect(() => {
    if (businessProfile.state) {
      const isCanadian = CANADIAN_PROVINCES.some(p => p.code === businessProfile.state);
      if (isCanadian) {
        setCountry('CA');
      }
    }
  }, [businessProfile.state]);

  const handleInputChange = (field: keyof typeof businessProfile, value: string) => {
    updateBusinessProfile({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validatePostalCode = (code: string, countryCode: 'US' | 'CA'): boolean => {
    if (!code) return false;

    if (countryCode === 'US') {
      // US ZIP: 12345 or 12345-6789
      return /^\d{5}(-\d{4})?$/.test(code);
    } else {
      // Canadian Postal Code: A1A 1A1 (flexible with spacing)
      return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(code);
    }
  };

  const formatPostalCode = (value: string, countryCode: 'US' | 'CA'): string => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    if (countryCode === 'US') {
      // Format as 12345 or 12345-6789
      if (cleaned.length <= 5) return cleaned;
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}`;
    } else {
      // Format as A1A 1A1
      if (cleaned.length <= 3) return cleaned;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
    }
  };

  const handlePostalCodeChange = (value: string) => {
    const formatted = formatPostalCode(value, country);
    handleInputChange('zipCode', formatted);

    // Validate
    if (formatted && !validatePostalCode(formatted, country)) {
      setErrors(prev => ({
        ...prev,
        zipCode: country === 'US' ? 'Invalid ZIP code (e.g., 12345)' : 'Invalid postal code (e.g., A1A 1A1)'
      }));
    } else {
      setErrors(prev => ({ ...prev, zipCode: '' }));
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

  const formatPhoneNumber = (value: string, countryCode: 'US' | 'CA'): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    if (countryCode === 'US') {
      // US/Canada format: (123) 456-7890
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (!match) return value;

      const [, area, prefix, line] = match;
      if (line) {
        return `(${area}) ${prefix}-${line}`;
      } else if (prefix) {
        return `(${area}) ${prefix}`;
      } else if (area) {
        return area.length === 3 ? `(${area}) ` : `(${area}`;
      }
    } else {
      // Same format for Canada
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (!match) return value;

      const [, area, prefix, line] = match;
      if (line) {
        return `(${area}) ${prefix}-${line}`;
      } else if (prefix) {
        return `(${area}) ${prefix}`;
      } else if (area) {
        return area.length === 3 ? `(${area}) ` : `(${area}`;
      }
    }
    return '';
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value, country);
    handleInputChange('phone', formatted);
  };

  const handleCountryChange = (newCountry: 'US' | 'CA') => {
    setCountry(newCountry);
    // Clear state and postal code when switching countries, and save country
    updateBusinessProfile({ state: '', zipCode: '', country: newCountry });
    setErrors(prev => ({ ...prev, state: '', zipCode: '' }));
  };

  const stateOptions = country === 'US' ? US_STATES : CANADIAN_PROVINCES;
  const stateLabel = country === 'US' ? 'State' : 'Province';
  const postalCodeLabel = country === 'US' ? 'ZIP Code' : 'Postal Code';
  const postalCodePlaceholder = country === 'US' ? 'e.g., 12345' : 'e.g., A1A 1A1';

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Business Profile</h2>
        <p>Tell us about your auto shop</p>
      </div>

      <div className="step-content">
        {/* Country Selector */}
        <div className="form-group">
          <label>Country <span className="required">*</span></label>
          <div className="country-selector">
            <button
              type="button"
              className={`country-button ${country === 'US' ? 'active' : ''}`}
              onClick={() => handleCountryChange('US')}
            >
              🇺🇸 United States
            </button>
            <button
              type="button"
              className={`country-button ${country === 'CA' ? 'active' : ''}`}
              onClick={() => handleCountryChange('CA')}
            >
              🇨🇦 Canada
            </button>
          </div>
        </div>

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
            required
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
            required
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        {/* City, State, Postal Code */}
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
              required
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="state">
              {stateLabel} <span className="required">*</span>
            </label>
            <select
              id="state"
              value={businessProfile.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={errors.state ? 'error' : ''}
              required
            >
              <option value="">Select {stateLabel}</option>
              {stateOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="zipCode">
              {postalCodeLabel} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              value={businessProfile.zipCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder={postalCodePlaceholder}
              maxLength={country === 'US' ? 10 : 7}
              className={errors.zipCode ? 'error' : ''}
              required
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
            required
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
          <small className="help-text">This will be visible to customers</small>
        </div>

        {/* Email (optional) */}
        <div className="form-group">
          <label htmlFor="email">Business Email <span className="optional-label">(optional)</span></label>
          <input
            type="email"
            id="email"
            value={businessProfile.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="e.g., info@calebauto.com"
          />
          <small className="help-text">For customer inquiries</small>
        </div>

        {/* Logo Upload (optional) */}
        <div className="form-group">
          <label>Business Logo <span className="optional-label">(optional)</span></label>
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
