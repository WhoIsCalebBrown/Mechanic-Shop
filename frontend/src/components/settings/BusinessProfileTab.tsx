import type { TenantSettings } from '../../types/settings';

interface BusinessProfileTabProps {
  settings: TenantSettings;
  onChange: (settings: TenantSettings) => void;
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
];

export default function BusinessProfileTab({ settings, onChange }: BusinessProfileTabProps) {
  const handleChange = (field: keyof TenantSettings, value: string) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;

    const [, area, prefix, line] = match;
    if (line) return `(${area}) ${prefix}-${line}`;
    if (prefix) return `(${area}) ${prefix}`;
    if (area) return `(${area}`;
    return cleaned;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleChange('phone', formatted);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateZipCode = (zip: string): boolean => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  return (
    <div className="settings-tab">
      <h2>Business Profile</h2>
      <p className="tab-description">Update your business information and contact details</p>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="businessName">
            Business Name <span className="required">*</span>
          </label>
          <input
            id="businessName"
            type="text"
            value={settings.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={!validateEmail(settings.email) && settings.email ? 'invalid' : ''}
            required
          />
          {!validateEmail(settings.email) && settings.email && (
            <span className="field-error">Please enter a valid email address</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={settings.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 555-5555"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="timezone">
            Timezone <span className="required">*</span>
          </label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            required
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field full-width">
          <label htmlFor="address">
            Street Address <span className="required">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="city">
            City <span className="required">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={settings.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="state">
            State <span className="required">*</span>
          </label>
          <input
            id="state"
            type="text"
            value={settings.state}
            onChange={(e) => handleChange('state', e.target.value)}
            maxLength={2}
            placeholder="CA"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="zipCode">
            ZIP Code <span className="required">*</span>
          </label>
          <input
            id="zipCode"
            type="text"
            value={settings.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className={!validateZipCode(settings.zipCode) && settings.zipCode ? 'invalid' : ''}
            placeholder="12345"
            required
          />
          {!validateZipCode(settings.zipCode) && settings.zipCode && (
            <span className="field-error">Please enter a valid ZIP code</span>
          )}
        </div>
      </div>
    </div>
  );
}
