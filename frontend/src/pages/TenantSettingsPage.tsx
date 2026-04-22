import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { tenantSettingsApi } from '../services/tenantSettings';
import type { TenantSettings } from '../types/settings';
import BusinessProfileTab from '../components/settings/BusinessProfileTab';
import BrandingTab from '../components/settings/BrandingTab';
import NotificationsTab from '../components/settings/NotificationsTab';
import AvailabilityTab from '../components/settings/AvailabilityTab';
import './TenantSettingsPage.css';

type TabType = 'profile' | 'branding' | 'notifications' | 'availability';

export default function TenantSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<TenantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await tenantSettingsApi.getSettings();
      setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(data))); // Deep clone
      setHasChanges(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const updated = await tenantSettingsApi.updateSettings(settings);
      setSettings(updated);
      setOriginalSettings(JSON.parse(JSON.stringify(updated)));
      setHasChanges(false);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalSettings) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      setHasChanges(false);
      toast.success('Changes discarded');
    }
  };

  const handleSettingsChange = (updatedSettings: TenantSettings) => {
    setSettings(updatedSettings);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings-page">
        <div className="settings-error">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Toaster position="top-right" />

      <div className="settings-header">
        <h1>Tenant Settings</h1>
        <p>Manage your business profile, branding, and preferences</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
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
        {activeTab === 'profile' && (
          <BusinessProfileTab settings={settings} onChange={handleSettingsChange} />
        )}
        {activeTab === 'branding' && (
          <BrandingTab settings={settings} onChange={handleSettingsChange} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab settings={settings} onChange={handleSettingsChange} />
        )}
        {activeTab === 'availability' && (
          <AvailabilityTab settings={settings} onChange={handleSettingsChange} />
        )}
      </div>

      {hasChanges && (
        <div className="settings-actions">
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
