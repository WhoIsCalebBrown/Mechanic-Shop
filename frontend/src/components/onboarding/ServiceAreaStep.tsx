import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

export default function ServiceAreaStep() {
  const { onboardingData, updateServiceArea } = useOnboarding();
  const { serviceArea } = onboardingData;

  const handleInputChange = (field: keyof typeof serviceArea, value: string | number) => {
    updateServiceArea({ [field]: value });
  };

  const radiusOptions = [10, 15, 25, 50, 75, 100];

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Service Area</h2>
        <p>Define where you provide services</p>
      </div>

      <div className="step-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="serviceCity">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              id="serviceCity"
              value={serviceArea.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="e.g., Springfield"
            />
          </div>

          <div className="form-group">
            <label htmlFor="serviceState">
              State <span className="required">*</span>
            </label>
            <input
              type="text"
              id="serviceState"
              value={serviceArea.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="e.g., IL"
              maxLength={2}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="radius">
            Service Radius <span className="required">*</span>
          </label>
          <div className="radius-selector">
            <div className="radius-buttons">
              {radiusOptions.map((radius) => (
                <button
                  key={radius}
                  type="button"
                  className={`radius-option ${serviceArea.radiusMiles === radius ? 'active' : ''}`}
                  onClick={() => handleInputChange('radiusMiles', radius)}
                >
                  {radius} mi
                </button>
              ))}
            </div>
            <div className="radius-display">
              <span className="radius-value">{serviceArea.radiusMiles}</span>
              <span className="radius-label">miles from {serviceArea.city || 'your shop'}</span>
            </div>
          </div>
        </div>

        <div className="info-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>
            This radius determines the area where you'll accept service calls. You can change this later in settings.
          </p>
        </div>
      </div>
    </div>
  );
}
