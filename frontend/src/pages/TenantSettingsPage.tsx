import { useState, useEffect, ChangeEvent } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  TenantSettingsDto,
  UpdateTenantSettingsDto,
  NotificationSettingsDto,
  AvailabilityRulesDto,
  WeeklyScheduleDto,
  DayScheduleDto,
  DateOverrideDto
} from '../generated/api';
import { tenantSettingsApi } from '../services/api';
import './TenantSettingsPage.css';

const TenantSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState<TenantSettingsDto | null>(null);
  const [originalSettings, setOriginalSettings] = useState<TenantSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await tenantSettingsApi.get();
      setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(data))); // Deep copy
      setLogoPreview(data.logoUrl || null);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings || !validateForm()) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const updateDto: UpdateTenantSettingsDto = {
        name: settings.name,
        businessAddress: settings.businessAddress,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode,
        country: settings.country,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        description: settings.description,
        timeZone: settings.timeZone,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        notifications: settings.notifications,
        availabilityRules: settings.availabilityRules
      };

      const updated = await tenantSettingsApi.update(updateDto);
      setSettings(updated);
      setOriginalSettings(JSON.parse(JSON.stringify(updated)));
      showSuccess('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showError(`Failed to save settings: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (originalSettings) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      setLogoPreview(originalSettings.logoUrl || null);
      setErrors({});
      setSaveMessage('');
      showSuccess('Changes discarded');
    }
  };

  const handleInputChange = (field: keyof TenantSettingsDto, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
      // Clear error for this field
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
  };

  const handleNotificationChange = (field: keyof NotificationSettingsDto, value: boolean) => {
    if (settings) {
      const notifications = settings.notifications || new NotificationSettingsDto();
      setSettings({
        ...settings,
        notifications: { ...notifications, [field]: value }
      });
    }
  };

  const handleDayScheduleChange = (day: keyof WeeklyScheduleDto, field: keyof DayScheduleDto, value: any) => {
    if (settings) {
      const weeklySchedule = settings.availabilityRules?.weeklySchedule || new WeeklyScheduleDto();
      const daySchedule = (weeklySchedule as any)[day] || new DayScheduleDto();

      setSettings({
        ...settings,
        availabilityRules: {
          ...settings.availabilityRules,
          weeklySchedule: {
            ...weeklySchedule,
            [day]: { ...daySchedule, [field]: value }
          }
        } as AvailabilityRulesDto
      });
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, logo: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, logo: 'Image size must be less than 2MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      handleInputChange('logoUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings) return false;

    // Validate required fields based on active tab
    if (activeTab === 'business') {
      if (!settings.name?.trim()) {
        newErrors.name = 'Business name is required';
      }
      if (settings.email && !isValidEmail(settings.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (settings.phone && !isValidPhone(settings.phone)) {
        newErrors.phone = 'Invalid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    return /^[\d\s\-\+\(\)]+$/.test(phone);
  };

  const showSuccess = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const showError = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const hasUnsavedChanges = (): boolean => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  if (loading) {
    return <div className="loading-container">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="error-container">Failed to load settings</div>;
  }

  return (
    <div className="tenant-settings-page">
      <div className="settings-header">
        <h1>Shop Settings</h1>
        <p>Manage your business profile, branding, notifications, and availability</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          Business Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          Branding
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab-button ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          Hours & Availability
        </button>
      </div>

      <div className="settings-content">
        {/* Business Profile Tab */}
        {activeTab === 'business' && (
          <div className="tab-content">
            <h2>Business Profile</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Business Name *</label>
                <input
                  type="text"
                  id="name"
                  value={settings.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={settings.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  value={settings.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  value={settings.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="businessAddress">Street Address</label>
                <input
                  type="text"
                  id="businessAddress"
                  value={settings.businessAddress || ''}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  value={settings.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  value={settings.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  maxLength={2}
                  placeholder="CA"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  value={settings.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeZone">Time Zone</label>
                <select
                  id="timeZone"
                  value={settings.timeZone || 'America/New_York'}
                  onChange={(e) => handleInputChange('timeZone', e.target.value)}
                >
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Chicago">Central (CT)</option>
                  <option value="America/Denver">Mountain (MT)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="America/Phoenix">Arizona (MST)</option>
                  <option value="America/Anchorage">Alaska (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii (HST)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={settings.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Brief description of your business..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="tab-content">
            <h2>Branding</h2>
            <div className="branding-section">
              <div className="form-group">
                <label>Logo</label>
                <div className="logo-upload-container">
                  {logoPreview && (
                    <div className="logo-preview">
                      <img src={logoPreview} alt="Logo preview" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    id="logo-upload"
                    className="file-input"
                  />
                  <label htmlFor="logo-upload" className="file-input-label">
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  <p className="help-text">Recommended: Square image, max 2MB</p>
                  {errors.logo && <span className="error-message">{errors.logo}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="primaryColor">Primary Color</label>
                <div className="color-picker-container">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: settings.primaryColor || '#f50538' }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <span>{settings.primaryColor || '#f50538'}</span>
                  </div>
                  {showColorPicker && (
                    <div className="color-picker-popover">
                      <div className="color-picker-cover" onClick={() => setShowColorPicker(false)} />
                      <HexColorPicker
                        color={settings.primaryColor || '#f50538'}
                        onChange={(color) => handleInputChange('primaryColor', color)}
                      />
                    </div>
                  )}
                </div>
                <p className="help-text">Choose a color that represents your brand</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="tab-content">
            <h2>Notification Preferences</h2>
            <p className="tab-description">
              Choose how you'd like to be notified about events in your shop
            </p>

            <div className="notifications-grid">
              <div className="notification-section">
                <h3>Email Notifications</h3>
                <div className="notification-toggles">
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.emailOnNewBooking ?? true}
                        onChange={(e) => handleNotificationChange('emailOnNewBooking', e.target.checked)}
                      />
                      <span>New Booking</span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.emailOnCancellation ?? true}
                        onChange={(e) => handleNotificationChange('emailOnCancellation', e.target.checked)}
                      />
                      <span>Booking Cancellation</span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.emailOnPaymentReceived ?? true}
                        onChange={(e) => handleNotificationChange('emailOnPaymentReceived', e.target.checked)}
                      />
                      <span>Payment Received</span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.emailOnServiceComplete ?? true}
                        onChange={(e) => handleNotificationChange('emailOnServiceComplete', e.target.checked)}
                      />
                      <span>Service Complete</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="notification-section">
                <h3>SMS Notifications</h3>
                <div className="notification-toggles">
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.smsOnNewBooking ?? false}
                        onChange={(e) => handleNotificationChange('smsOnNewBooking', e.target.checked)}
                      />
                      <span>New Booking</span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.smsOnCancellation ?? false}
                        onChange={(e) => handleNotificationChange('smsOnCancellation', e.target.checked)}
                      />
                      <span>Booking Cancellation</span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.smsOnPaymentReceived ?? false}
                        onChange={(e) => handleNotificationChange('smsOnPaymentReceived', e.target.checked)}
                      />
                      <span>Payment Received</span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.smsOnServiceComplete ?? false}
                        onChange={(e) => handleNotificationChange('smsOnServiceComplete', e.target.checked)}
                      />
                      <span>Service Complete</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hours & Availability Tab */}
        {activeTab === 'availability' && (
          <div className="tab-content">
            <h2>Hours & Availability</h2>
            <p className="tab-description">
              Set your regular business hours and special date overrides
            </p>

            <div className="weekly-schedule">
              <h3>Weekly Schedule</h3>
              {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                const daySchedule = settings.availabilityRules?.weeklySchedule?.[day] || new DayScheduleDto();
                const dayName = day.charAt(0).toUpperCase() + day.slice(1);

                return (
                  <div key={day} className="day-schedule-row">
                    <div className="day-name">{dayName}</div>
                    <div className="day-toggle">
                      <label>
                        <input
                          type="checkbox"
                          checked={daySchedule.isOpen ?? false}
                          onChange={(e) => handleDayScheduleChange(day, 'isOpen', e.target.checked)}
                        />
                        <span>Open</span>
                      </label>
                    </div>
                    {daySchedule.isOpen && (
                      <div className="day-times">
                        <input
                          type="time"
                          value={daySchedule.openTime || '08:00'}
                          onChange={(e) => handleDayScheduleChange(day, 'openTime', e.target.value)}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={daySchedule.closeTime || '17:00'}
                          onChange={(e) => handleDayScheduleChange(day, 'closeTime', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="date-overrides">
              <h3>Holiday & Special Dates</h3>
              <p className="help-text">
                Override your regular hours for holidays and special occasions
              </p>
              <button className="add-override-button" onClick={() => {
                // TODO: Implement add override functionality
                alert('Adding date overrides will be implemented in a future update');
              }}>
                + Add Date Override
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Container */}
      {hasUnsavedChanges() && (
        <div className="floating-save-container">
          <div className="save-actions">
            <button
              className="discard-button"
              onClick={handleDiscard}
              disabled={saving}
            >
              Discard Changes
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {saveMessage && (
            <div className={`save-message ${saveMessage.includes('success') || saveMessage.includes('discarded') ? 'success' : 'error'}`}>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantSettingsPage;
