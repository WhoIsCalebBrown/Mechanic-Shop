import React, { useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'react-hot-toast';
import type { TenantSettings } from '../../types/settings';
import { tenantSettingsApi } from '../../services/tenantSettings';

interface BrandingTabProps {
  settings: TenantSettings;
  onChange: (settings: TenantSettings) => void;
}

export default function BrandingTab({ settings, onChange }: BrandingTabProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingLogo(true);
      const response = await tenantSettingsApi.uploadLogo(file);

      onChange({
        ...settings,
        branding: {
          ...settings.branding,
          logoUrl: response.logoUrl,
        },
      });

      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    onChange({
      ...settings,
      branding: {
        ...settings.branding,
        logoUrl: undefined,
      },
    });
    toast.success('Logo removed');
  };

  const handleColorChange = (color: string) => {
    onChange({
      ...settings,
      branding: {
        ...settings.branding,
        primaryColor: color,
      },
    });
  };

  const handleSecondaryColorChange = (color: string) => {
    onChange({
      ...settings,
      branding: {
        ...settings.branding,
        secondaryColor: color,
      },
    });
  };

  return (
    <div className="settings-tab">
      <h2>Branding</h2>
      <p className="tab-description">Customize your shop's visual identity</p>

      <div className="branding-section">
        <h3>Logo</h3>
        <div className="logo-upload-container">
          {settings.branding.logoUrl ? (
            <div className="logo-preview">
              <img src={settings.branding.logoUrl} alt="Business logo" />
              <button
                type="button"
                className="btn-remove-logo"
                onClick={handleRemoveLogo}
                disabled={isUploadingLogo}
              >
                Remove Logo
              </button>
            </div>
          ) : (
            <div className="logo-placeholder">
              <p>No logo uploaded</p>
            </div>
          )}

          <div className="logo-upload-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
              disabled={isUploadingLogo}
            />
            <button
              type="button"
              className="btn-upload-logo"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingLogo}
            >
              {isUploadingLogo ? 'Uploading...' : settings.branding.logoUrl ? 'Change Logo' : 'Upload Logo'}
            </button>
            <span className="upload-hint">PNG, JPG up to 5MB</span>
          </div>
        </div>
      </div>

      <div className="branding-section">
        <h3>Primary Color</h3>
        <p className="color-description">This color will be used for buttons, links, and accents</p>

        <div className="color-picker-container">
          <button
            type="button"
            className="color-swatch"
            style={{ backgroundColor: settings.branding.primaryColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <span className="color-value">{settings.branding.primaryColor}</span>
          </button>

          {showColorPicker && (
            <div className="color-picker-popover">
              <div
                className="color-picker-backdrop"
                onClick={() => setShowColorPicker(false)}
              />
              <div className="color-picker-content">
                <HexColorPicker
                  color={settings.branding.primaryColor}
                  onChange={handleColorChange}
                />
                <input
                  type="text"
                  value={settings.branding.primaryColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      handleColorChange(value);
                    }
                  }}
                  className="color-input"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>

        <div className="color-presets">
          <span className="presets-label">Quick colors:</span>
          {['#2563eb', '#dc2626', '#16a34a', '#ea580c', '#9333ea', '#0891b2'].map((color) => (
            <button
              key={color}
              type="button"
              className="color-preset"
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="branding-section">
        <h3>Secondary Color (Optional)</h3>
        <p className="color-description">Used for secondary elements and hover states</p>

        <div className="color-picker-container">
          <button
            type="button"
            className="color-swatch"
            style={{ backgroundColor: settings.branding.secondaryColor || '#e5e7eb' }}
            onClick={() => {
              if (!settings.branding.secondaryColor) {
                handleSecondaryColorChange('#6b7280');
              }
            }}
          >
            <span className="color-value">
              {settings.branding.secondaryColor || 'Not set'}
            </span>
          </button>

          {settings.branding.secondaryColor && (
            <>
              <button
                type="button"
                className="btn-clear-color"
                onClick={() => handleSecondaryColorChange('')}
              >
                Clear
              </button>
              <div className="color-picker-content-inline">
                <HexColorPicker
                  color={settings.branding.secondaryColor}
                  onChange={handleSecondaryColorChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
