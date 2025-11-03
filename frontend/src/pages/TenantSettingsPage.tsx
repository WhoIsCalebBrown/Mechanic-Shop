import { useState, useEffect, type ChangeEvent } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  TenantSettingsDto,
  UpdateTenantSettingsDto,
  NotificationSettingsDto,
  AvailabilityRulesDto,
  WeeklyScheduleDto,
  DayScheduleDto
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
      const updateDto = {
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
        availabilityRules: settings.availabilityRules,

        // Public Profile - Stats
        tagline: settings.tagline,
        vehiclesServiced: settings.vehiclesServiced,
        satisfactionRate: settings.satisfactionRate,
        yearsExperience: settings.yearsExperience,

        // Public Profile - Hero Section
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        primaryCtaText: settings.primaryCtaText,
        secondaryCtaText: settings.secondaryCtaText,
        heroImageUrl: settings.heroImageUrl,

        // Public Profile - Services
        service1Title: settings.service1Title,
        service1Description: settings.service1Description,
        service1Feature1: settings.service1Feature1,
        service1Feature2: settings.service1Feature2,
        service1Feature3: settings.service1Feature3,
        service1Feature4: settings.service1Feature4,
        service1ImageUrl: settings.service1ImageUrl,

        service2Title: settings.service2Title,
        service2Description: settings.service2Description,
        service2Feature1: settings.service2Feature1,
        service2Feature2: settings.service2Feature2,
        service2Feature3: settings.service2Feature3,
        service2Feature4: settings.service2Feature4,
        service2ImageUrl: settings.service2ImageUrl,

        service3Title: settings.service3Title,
        service3Description: settings.service3Description,
        service3Feature1: settings.service3Feature1,
        service3Feature2: settings.service3Feature2,
        service3Feature3: settings.service3Feature3,
        service3Feature4: settings.service3Feature4,
        service3ImageUrl: settings.service3ImageUrl,

        // Public Profile - Why Choose Us
        whyFeature1Title: settings.whyFeature1Title,
        whyFeature1Description: settings.whyFeature1Description,
        whyFeature2Title: settings.whyFeature2Title,
        whyFeature2Description: settings.whyFeature2Description,
        whyFeature3Title: settings.whyFeature3Title,
        whyFeature3Description: settings.whyFeature3Description,
        whyFeature4Title: settings.whyFeature4Title,
        whyFeature4Description: settings.whyFeature4Description,

        // Public Profile - CTA Section
        ctaTitle: settings.ctaTitle,
        ctaSubtitle: settings.ctaSubtitle,
        ctaButtonText: settings.ctaButtonText
      } as UpdateTenantSettingsDto;

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
      setSettings({ ...settings, [field]: value } as TenantSettingsDto);
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
        notifications: { ...notifications, [field]: value } as NotificationSettingsDto
      } as TenantSettingsDto);
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
      } as TenantSettingsDto);
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
        <button
          className={`tab-button ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          Hero Section
        </button>
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats & Features
        </button>
        <button
          className={`tab-button ${activeTab === 'cta' ? 'active' : ''}`}
          onClick={() => setActiveTab('cta')}
        >
          CTA Section
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

        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="tab-content">
            <h2>Hero Section</h2>
            <p className="tab-description">
              Customize the main banner/hero section of your public landing page
            </p>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="heroTitle">Hero Title</label>
                <textarea
                  id="heroTitle"
                  value={settings.heroTitle || ''}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  rows={3}
                  placeholder="PRECISION\nAUTOMOTIVE\nCARE"
                />
                <p className="help-text">Main headline - use \n for line breaks</p>
              </div>

              <div className="form-group full-width">
                <label htmlFor="heroSubtitle">Hero Subtitle</label>
                <input
                  type="text"
                  id="heroSubtitle"
                  value={settings.heroSubtitle || ''}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                  placeholder="Expert Service for Your Vehicle"
                />
              </div>

              <div className="form-group">
                <label htmlFor="primaryCtaText">Primary Button Text</label>
                <input
                  type="text"
                  id="primaryCtaText"
                  value={settings.primaryCtaText || ''}
                  onChange={(e) => handleInputChange('primaryCtaText', e.target.value)}
                  placeholder="Schedule Service"
                />
              </div>

              <div className="form-group">
                <label htmlFor="secondaryCtaText">Secondary Button Text</label>
                <input
                  type="text"
                  id="secondaryCtaText"
                  value={settings.secondaryCtaText || ''}
                  onChange={(e) => handleInputChange('secondaryCtaText', e.target.value)}
                  placeholder="Our Services"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="heroImageUrl">Hero Image URL</label>
                <input
                  type="url"
                  id="heroImageUrl"
                  value={settings.heroImageUrl || ''}
                  onChange={(e) => handleInputChange('heroImageUrl', e.target.value)}
                  placeholder="https://example.com/hero-image.jpg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="tab-content">
            <h2>Services</h2>
            <p className="tab-description">
              Showcase your main service offerings on your public page
            </p>

            {/* Service 1 */}
            <div className="service-section">
              <h3>Service 1</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="service1Title">Title</label>
                  <input
                    type="text"
                    id="service1Title"
                    value={settings.service1Title || ''}
                    onChange={(e) => handleInputChange('service1Title', e.target.value)}
                    placeholder="Routine Maintenance"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="service1Description">Description</label>
                  <textarea
                    id="service1Description"
                    value={settings.service1Description || ''}
                    onChange={(e) => handleInputChange('service1Description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of this service..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service1Feature1">Feature 1</label>
                  <input
                    type="text"
                    id="service1Feature1"
                    value={settings.service1Feature1 || ''}
                    onChange={(e) => handleInputChange('service1Feature1', e.target.value)}
                    placeholder="Oil & Filter Change"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service1Feature2">Feature 2</label>
                  <input
                    type="text"
                    id="service1Feature2"
                    value={settings.service1Feature2 || ''}
                    onChange={(e) => handleInputChange('service1Feature2', e.target.value)}
                    placeholder="Brake Inspection"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service1Feature3">Feature 3</label>
                  <input
                    type="text"
                    id="service1Feature3"
                    value={settings.service1Feature3 || ''}
                    onChange={(e) => handleInputChange('service1Feature3', e.target.value)}
                    placeholder="Tire Rotation"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service1Feature4">Feature 4</label>
                  <input
                    type="text"
                    id="service1Feature4"
                    value={settings.service1Feature4 || ''}
                    onChange={(e) => handleInputChange('service1Feature4', e.target.value)}
                    placeholder="Fluid Top-ups"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="service1ImageUrl">Image URL</label>
                  <input
                    type="url"
                    id="service1ImageUrl"
                    value={settings.service1ImageUrl || ''}
                    onChange={(e) => handleInputChange('service1ImageUrl', e.target.value)}
                    placeholder="https://example.com/service1.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Service 2 */}
            <div className="service-section">
              <h3>Service 2</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="service2Title">Title</label>
                  <input
                    type="text"
                    id="service2Title"
                    value={settings.service2Title || ''}
                    onChange={(e) => handleInputChange('service2Title', e.target.value)}
                    placeholder="Diagnostics & Repair"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="service2Description">Description</label>
                  <textarea
                    id="service2Description"
                    value={settings.service2Description || ''}
                    onChange={(e) => handleInputChange('service2Description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of this service..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service2Feature1">Feature 1</label>
                  <input
                    type="text"
                    id="service2Feature1"
                    value={settings.service2Feature1 || ''}
                    onChange={(e) => handleInputChange('service2Feature1', e.target.value)}
                    placeholder="Computer Diagnostics"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service2Feature2">Feature 2</label>
                  <input
                    type="text"
                    id="service2Feature2"
                    value={settings.service2Feature2 || ''}
                    onChange={(e) => handleInputChange('service2Feature2', e.target.value)}
                    placeholder="Engine Repair"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service2Feature3">Feature 3</label>
                  <input
                    type="text"
                    id="service2Feature3"
                    value={settings.service2Feature3 || ''}
                    onChange={(e) => handleInputChange('service2Feature3', e.target.value)}
                    placeholder="Transmission Service"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service2Feature4">Feature 4</label>
                  <input
                    type="text"
                    id="service2Feature4"
                    value={settings.service2Feature4 || ''}
                    onChange={(e) => handleInputChange('service2Feature4', e.target.value)}
                    placeholder="Electrical Systems"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="service2ImageUrl">Image URL</label>
                  <input
                    type="url"
                    id="service2ImageUrl"
                    value={settings.service2ImageUrl || ''}
                    onChange={(e) => handleInputChange('service2ImageUrl', e.target.value)}
                    placeholder="https://example.com/service2.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Service 3 */}
            <div className="service-section">
              <h3>Service 3</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="service3Title">Title</label>
                  <input
                    type="text"
                    id="service3Title"
                    value={settings.service3Title || ''}
                    onChange={(e) => handleInputChange('service3Title', e.target.value)}
                    placeholder="Performance Upgrades"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="service3Description">Description</label>
                  <textarea
                    id="service3Description"
                    value={settings.service3Description || ''}
                    onChange={(e) => handleInputChange('service3Description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of this service..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service3Feature1">Feature 1</label>
                  <input
                    type="text"
                    id="service3Feature1"
                    value={settings.service3Feature1 || ''}
                    onChange={(e) => handleInputChange('service3Feature1', e.target.value)}
                    placeholder="Engine Tuning"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service3Feature2">Feature 2</label>
                  <input
                    type="text"
                    id="service3Feature2"
                    value={settings.service3Feature2 || ''}
                    onChange={(e) => handleInputChange('service3Feature2', e.target.value)}
                    placeholder="Suspension Upgrades"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service3Feature3">Feature 3</label>
                  <input
                    type="text"
                    id="service3Feature3"
                    value={settings.service3Feature3 || ''}
                    onChange={(e) => handleInputChange('service3Feature3', e.target.value)}
                    placeholder="Exhaust Systems"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service3Feature4">Feature 4</label>
                  <input
                    type="text"
                    id="service3Feature4"
                    value={settings.service3Feature4 || ''}
                    onChange={(e) => handleInputChange('service3Feature4', e.target.value)}
                    placeholder="Brake Upgrades"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="service3ImageUrl">Image URL</label>
                  <input
                    type="url"
                    id="service3ImageUrl"
                    value={settings.service3ImageUrl || ''}
                    onChange={(e) => handleInputChange('service3ImageUrl', e.target.value)}
                    placeholder="https://example.com/service3.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats & Features Tab */}
        {activeTab === 'stats' && (
          <div className="tab-content">
            <h2>Stats & Features</h2>
            <p className="tab-description">
              Highlight your achievements and key selling points
            </p>

            {/* Stats */}
            <div className="stats-section">
              <h3>Business Stats</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="tagline">Tagline</label>
                  <input
                    type="text"
                    id="tagline"
                    value={settings.tagline || ''}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="Expert Service for Your Vehicle"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vehiclesServiced">Vehicles Serviced</label>
                  <input
                    type="number"
                    id="vehiclesServiced"
                    value={settings.vehiclesServiced || 0}
                    onChange={(e) => handleInputChange('vehiclesServiced', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="satisfactionRate">Satisfaction Rate (%)</label>
                  <input
                    type="number"
                    id="satisfactionRate"
                    value={settings.satisfactionRate || 0}
                    onChange={(e) => handleInputChange('satisfactionRate', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="yearsExperience">Years of Experience</label>
                  <input
                    type="number"
                    id="yearsExperience"
                    value={settings.yearsExperience || 0}
                    onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Why Choose Us Features */}
            <div className="why-section">
              <h3>Why Choose Us Features</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="whyFeature1Title">Feature 1 Title</label>
                  <input
                    type="text"
                    id="whyFeature1Title"
                    value={settings.whyFeature1Title || ''}
                    onChange={(e) => handleInputChange('whyFeature1Title', e.target.value)}
                    placeholder="Expert Technicians"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whyFeature1Description">Feature 1 Description</label>
                  <input
                    type="text"
                    id="whyFeature1Description"
                    value={settings.whyFeature1Description || ''}
                    onChange={(e) => handleInputChange('whyFeature1Description', e.target.value)}
                    placeholder="ASE-certified mechanics with decades of combined experience"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whyFeature2Title">Feature 2 Title</label>
                  <input
                    type="text"
                    id="whyFeature2Title"
                    value={settings.whyFeature2Title || ''}
                    onChange={(e) => handleInputChange('whyFeature2Title', e.target.value)}
                    placeholder="Quality Parts"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whyFeature2Description">Feature 2 Description</label>
                  <input
                    type="text"
                    id="whyFeature2Description"
                    value={settings.whyFeature2Description || ''}
                    onChange={(e) => handleInputChange('whyFeature2Description', e.target.value)}
                    placeholder="We use only OEM and premium aftermarket parts"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whyFeature3Title">Feature 3 Title</label>
                  <input
                    type="text"
                    id="whyFeature3Title"
                    value={settings.whyFeature3Title || ''}
                    onChange={(e) => handleInputChange('whyFeature3Title', e.target.value)}
                    placeholder="Transparent Pricing"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whyFeature3Description">Feature 3 Description</label>
                  <input
                    type="text"
                    id="whyFeature3Description"
                    value={settings.whyFeature3Description || ''}
                    onChange={(e) => handleInputChange('whyFeature3Description', e.target.value)}
                    placeholder="No hidden fees, detailed estimates before any work begins"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whyFeature4Title">Feature 4 Title</label>
                  <input
                    type="text"
                    id="whyFeature4Title"
                    value={settings.whyFeature4Title || ''}
                    onChange={(e) => handleInputChange('whyFeature4Title', e.target.value)}
                    placeholder="Warranty Coverage"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whyFeature4Description">Feature 4 Description</label>
                  <input
                    type="text"
                    id="whyFeature4Description"
                    value={settings.whyFeature4Description || ''}
                    onChange={(e) => handleInputChange('whyFeature4Description', e.target.value)}
                    placeholder="All services backed by our comprehensive warranty"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section Tab */}
        {activeTab === 'cta' && (
          <div className="tab-content">
            <h2>Call-to-Action Section</h2>
            <p className="tab-description">
              Customize the final call-to-action section on your public page
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="ctaTitle">CTA Title</label>
                <input
                  type="text"
                  id="ctaTitle"
                  value={settings.ctaTitle || ''}
                  onChange={(e) => handleInputChange('ctaTitle', e.target.value)}
                  placeholder="Ready to Get Started?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ctaSubtitle">CTA Subtitle</label>
                <input
                  type="text"
                  id="ctaSubtitle"
                  value={settings.ctaSubtitle || ''}
                  onChange={(e) => handleInputChange('ctaSubtitle', e.target.value)}
                  placeholder="Schedule your service appointment today"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ctaButtonText">Button Text</label>
                <input
                  type="text"
                  id="ctaButtonText"
                  value={settings.ctaButtonText || ''}
                  onChange={(e) => handleInputChange('ctaButtonText', e.target.value)}
                  placeholder="Book Appointment"
                />
              </div>
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
