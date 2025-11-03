import { useOnboarding } from '../../contexts/OnboardingContext';
import './OnboardingSteps.css';

// Radius options for US (miles) and Canada (kilometers)
const RADIUS_OPTIONS_MILES = [10, 15, 25, 50, 75, 100];
const RADIUS_OPTIONS_KM = [15, 25, 40, 80, 120, 160]; // Approximate km equivalents

export default function ServiceAreaStep() {
  const { onboardingData, updateServiceArea } = useOnboarding();
  const { serviceArea, businessProfile } = onboardingData;

  // Detect if user is in Canada based on province codes
  const CANADIAN_PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT'];
  const isCanada = businessProfile.country === 'CA' || CANADIAN_PROVINCES.includes(businessProfile.state);

  const radiusOptions = isCanada ? RADIUS_OPTIONS_KM : RADIUS_OPTIONS_MILES;
  const unit = isCanada ? 'km' : 'mi';
  const unitName = isCanada ? 'kilometers' : 'miles';

  const handleRadiusChange = (radius: number) => {
    updateServiceArea({ radiusMiles: radius });
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Service Area</h2>
        <p>How far will you travel for service calls?</p>
      </div>

      <div className="step-content">
        {/* Display business location */}
        <div className="info-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div>
            <p>
              <strong>Your shop location:</strong> {businessProfile.city}, {businessProfile.state}
              {isCanada && ' 🇨🇦'}
              {!isCanada && ' 🇺🇸'}
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              We'll use this as the center point for your service area radius.
            </p>
          </div>
        </div>

        {/* Service Radius Selector */}
        <div className="form-group">
          <label>Service Radius <span className="required">*</span></label>
          <p style={{ fontSize: '0.9rem', color: 'var(--audi-gray)', marginTop: '-0.25rem', marginBottom: '1rem' }}>
            Select how many {unitName} from your shop you're willing to travel
          </p>

          <div className="radius-buttons">
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                type="button"
                onClick={() => handleRadiusChange(radius)}
                className={`radius-option ${serviceArea.radiusMiles === radius ? 'active' : ''}`}
              >
                {radius} {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Display Current Selection */}
        <div className="radius-display">
          <span className="radius-value">{serviceArea.radiusMiles}</span>
          <span className="radius-label">{unitName} from {businessProfile.city}</span>
        </div>

        {/* Info box about service area */}
        <div className="info-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>
            This radius helps customers know if you service their area. You can always adjust this later in your settings.
          </p>
        </div>
      </div>
    </div>
  );
}
