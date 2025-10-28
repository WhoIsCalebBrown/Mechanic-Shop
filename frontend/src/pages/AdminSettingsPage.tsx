import { useState, useEffect } from 'react';
import './AdminSettingsPage.css';

interface SiteSettings {
  id: number;
  businessName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  mondayFridayHours: string;
  saturdayHours: string;
  sundayHours: string;
  vehiclesServiced: number;
  satisfactionRate: number;
  yearsExperience: number;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  service1Title: string;
  service1Description: string;
  service1Feature1: string;
  service1Feature2: string;
  service1Feature3: string;
  service1Feature4: string;
  service1ImageUrl: string | null;
  service2Title: string;
  service2Description: string;
  service2Feature1: string;
  service2Feature2: string;
  service2Feature3: string;
  service2Feature4: string;
  service2ImageUrl: string | null;
  service3Title: string;
  service3Description: string;
  service3Feature1: string;
  service3Feature2: string;
  service3Feature3: string;
  service3Feature4: string;
  service3ImageUrl: string | null;
  whyFeature1Title: string;
  whyFeature1Description: string;
  whyFeature2Title: string;
  whyFeature2Description: string;
  whyFeature3Title: string;
  whyFeature3Description: string;
  whyFeature4Title: string;
  whyFeature4Description: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
}

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sitesettings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveMessage('');

    try {
      console.log('Saving settings:', settings);

      const response = await fetch('http://localhost:5000/api/sitesettings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Save successful:', data);
        setSettings(data); // Update with server response
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const errorText = await response.text();
        console.error('Save failed:', response.status, errorText);
        setSaveMessage(`Error saving settings: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: string | number) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="admin-error">Failed to load settings</div>;
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-header">
        <h1>Site Settings</h1>
        <p>Customize your landing page content</p>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'business' ? 'active' : ''}
          onClick={() => setActiveTab('business')}
        >
          Business Info
        </button>
        <button
          className={activeTab === 'hero' ? 'active' : ''}
          onClick={() => setActiveTab('hero')}
        >
          Hero Section
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={activeTab === 'why' ? 'active' : ''}
          onClick={() => setActiveTab('why')}
        >
          Why Choose Us
        </button>
        <button
          className={activeTab === 'cta' ? 'active' : ''}
          onClick={() => setActiveTab('cta')}
        >
          Call to Action
        </button>
      </div>

      <div className="admin-content">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="settings-section">
            <h2>Business Information</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={settings.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={settings.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <h3>Hours of Operation</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Monday - Friday</label>
                <input
                  type="text"
                  value={settings.mondayFridayHours}
                  onChange={(e) => handleInputChange('mondayFridayHours', e.target.value)}
                  placeholder="8am - 6pm"
                />
              </div>

              <div className="form-group">
                <label>Saturday</label>
                <input
                  type="text"
                  value={settings.saturdayHours}
                  onChange={(e) => handleInputChange('saturdayHours', e.target.value)}
                  placeholder="9am - 4pm"
                />
              </div>

              <div className="form-group">
                <label>Sunday</label>
                <input
                  type="text"
                  value={settings.sundayHours}
                  onChange={(e) => handleInputChange('sundayHours', e.target.value)}
                  placeholder="Closed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="settings-section">
            <h2>Hero Section</h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Hero Title (use \n for line breaks)</label>
                <textarea
                  value={settings.heroTitle}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label>Hero Subtitle</label>
                <input
                  type="text"
                  value={settings.heroSubtitle}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Primary Button Text</label>
                <input
                  type="text"
                  value={settings.primaryCtaText}
                  onChange={(e) => handleInputChange('primaryCtaText', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Secondary Button Text</label>
                <input
                  type="text"
                  value={settings.secondaryCtaText}
                  onChange={(e) => handleInputChange('secondaryCtaText', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="settings-section">
            <h2>Statistics</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Vehicles Serviced</label>
                <input
                  type="number"
                  value={settings.vehiclesServiced}
                  onChange={(e) => handleInputChange('vehiclesServiced', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Satisfaction Rate (%)</label>
                <input
                  type="number"
                  value={settings.satisfactionRate}
                  onChange={(e) => handleInputChange('satisfactionRate', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  value={settings.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="settings-section">
            <h2>Services</h2>

            {/* Service 1 */}
            <div className="service-editor">
              <h3>Service 1</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title</label>
                  <input
                    type="text"
                    value={settings.service1Title}
                    onChange={(e) => handleInputChange('service1Title', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={settings.service1Description}
                    onChange={(e) => handleInputChange('service1Description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 1</label>
                  <input
                    type="text"
                    value={settings.service1Feature1}
                    onChange={(e) => handleInputChange('service1Feature1', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 2</label>
                  <input
                    type="text"
                    value={settings.service1Feature2}
                    onChange={(e) => handleInputChange('service1Feature2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 3</label>
                  <input
                    type="text"
                    value={settings.service1Feature3}
                    onChange={(e) => handleInputChange('service1Feature3', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 4</label>
                  <input
                    type="text"
                    value={settings.service1Feature4}
                    onChange={(e) => handleInputChange('service1Feature4', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Image URL (optional - leave blank for default)</label>
                  <input
                    type="text"
                    value={settings.service1ImageUrl || ''}
                    onChange={(e) => handleInputChange('service1ImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Service 2 */}
            <div className="service-editor">
              <h3>Service 2</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title</label>
                  <input
                    type="text"
                    value={settings.service2Title}
                    onChange={(e) => handleInputChange('service2Title', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={settings.service2Description}
                    onChange={(e) => handleInputChange('service2Description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 1</label>
                  <input
                    type="text"
                    value={settings.service2Feature1}
                    onChange={(e) => handleInputChange('service2Feature1', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 2</label>
                  <input
                    type="text"
                    value={settings.service2Feature2}
                    onChange={(e) => handleInputChange('service2Feature2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 3</label>
                  <input
                    type="text"
                    value={settings.service2Feature3}
                    onChange={(e) => handleInputChange('service2Feature3', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 4</label>
                  <input
                    type="text"
                    value={settings.service2Feature4}
                    onChange={(e) => handleInputChange('service2Feature4', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Image URL (optional - leave blank for default)</label>
                  <input
                    type="text"
                    value={settings.service2ImageUrl || ''}
                    onChange={(e) => handleInputChange('service2ImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Service 3 */}
            <div className="service-editor">
              <h3>Service 3</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title</label>
                  <input
                    type="text"
                    value={settings.service3Title}
                    onChange={(e) => handleInputChange('service3Title', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={settings.service3Description}
                    onChange={(e) => handleInputChange('service3Description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 1</label>
                  <input
                    type="text"
                    value={settings.service3Feature1}
                    onChange={(e) => handleInputChange('service3Feature1', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 2</label>
                  <input
                    type="text"
                    value={settings.service3Feature2}
                    onChange={(e) => handleInputChange('service3Feature2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 3</label>
                  <input
                    type="text"
                    value={settings.service3Feature3}
                    onChange={(e) => handleInputChange('service3Feature3', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Feature 4</label>
                  <input
                    type="text"
                    value={settings.service3Feature4}
                    onChange={(e) => handleInputChange('service3Feature4', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Image URL (optional - leave blank for default)</label>
                  <input
                    type="text"
                    value={settings.service3ImageUrl || ''}
                    onChange={(e) => handleInputChange('service3ImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us Tab */}
        {activeTab === 'why' && (
          <div className="settings-section">
            <h2>Why Choose Us</h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Feature 1 Title</label>
                <input
                  type="text"
                  value={settings.whyFeature1Title}
                  onChange={(e) => handleInputChange('whyFeature1Title', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Feature 1 Description</label>
                <input
                  type="text"
                  value={settings.whyFeature1Description}
                  onChange={(e) => handleInputChange('whyFeature1Description', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Feature 2 Title</label>
                <input
                  type="text"
                  value={settings.whyFeature2Title}
                  onChange={(e) => handleInputChange('whyFeature2Title', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Feature 2 Description</label>
                <input
                  type="text"
                  value={settings.whyFeature2Description}
                  onChange={(e) => handleInputChange('whyFeature2Description', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Feature 3 Title</label>
                <input
                  type="text"
                  value={settings.whyFeature3Title}
                  onChange={(e) => handleInputChange('whyFeature3Title', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Feature 3 Description</label>
                <input
                  type="text"
                  value={settings.whyFeature3Description}
                  onChange={(e) => handleInputChange('whyFeature3Description', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Feature 4 Title</label>
                <input
                  type="text"
                  value={settings.whyFeature4Title}
                  onChange={(e) => handleInputChange('whyFeature4Title', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Feature 4 Description</label>
                <input
                  type="text"
                  value={settings.whyFeature4Description}
                  onChange={(e) => handleInputChange('whyFeature4Description', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* CTA Tab */}
        {activeTab === 'cta' && (
          <div className="settings-section">
            <h2>Call to Action</h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>CTA Title</label>
                <input
                  type="text"
                  value={settings.ctaTitle}
                  onChange={(e) => handleInputChange('ctaTitle', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>CTA Subtitle</label>
                <input
                  type="text"
                  value={settings.ctaSubtitle}
                  onChange={(e) => handleInputChange('ctaSubtitle', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Button Text</label>
                <input
                  type="text"
                  value={settings.ctaButtonText}
                  onChange={(e) => handleInputChange('ctaButtonText', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="floating-save-container">
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
        <button
          className="btn-save-floating"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
