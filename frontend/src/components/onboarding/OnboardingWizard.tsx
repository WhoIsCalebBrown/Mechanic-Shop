import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { onboardingApi, convertOnboardingDataToRequest } from '../../services/onboarding';
import BusinessProfileStep from './BusinessProfileStep';
import ServiceAreaStep from './ServiceAreaStep';
import OperatingHoursStep from './OperatingHoursStep';
import ServicesStep from './ServicesStep';
import type { OnboardingStep } from '../../types';
import './OnboardingWizard.css';

const STEPS: OnboardingStep[] = [
  { id: 1, title: 'Business Profile', description: 'Basic information about your shop' },
  { id: 2, title: 'Service Area', description: 'Where you provide services' },
  { id: 3, title: 'Operating Hours', description: 'Your weekly schedule' },
  { id: 4, title: 'Services', description: 'What services you offer' },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentStep, setCurrentStep, canProceedToNextStep, onboardingData } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (!canProceedToNextStep()) {
      setError('Please fill in all required fields before proceeding');
      return;
    }

    setError(null);
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert frontend data to backend format
      const request = convertOnboardingDataToRequest(onboardingData);

      console.log('[Onboarding] Submitting onboarding data...');
      const response = await onboardingApi.complete(request);

      console.log('[Onboarding] Onboarding completed successfully:', response);

      // Onboarding is complete! Now we need to get a fresh JWT with tenant claims
      // The easiest way is to log out and have the user log back in
      alert('Setup complete! Please log in again to access your dashboard.');

      // Log out to clear the old token
      await logout();

      // Navigate to login page
      navigate('/login');
    } catch (err) {
      console.error('[Onboarding] Submission failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessProfileStep />;
      case 2:
        return <ServiceAreaStep />;
      case 3:
        return <OperatingHoursStep />;
      case 4:
        return <ServicesStep />;
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="onboarding-wizard">
      {/* Progress Bar */}
      <div className="wizard-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="progress-steps">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`progress-step ${currentStep === step.id ? 'active' : ''} ${
                currentStep > step.id ? 'completed' : ''
              }`}
            >
              <div className="step-circle">
                {currentStep > step.id ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <div className="step-info">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="progress-indicator">
          <span className="step-count">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="wizard-content">{renderStep()}</div>

      {/* Error Message */}
      {error && (
        <div className="wizard-error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="wizard-navigation">
        <button
          type="button"
          onClick={handleBack}
          className="nav-btn back-btn"
          disabled={currentStep === 1 || isSubmitting}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        {currentStep < STEPS.length ? (
          <button
            type="button"
            onClick={handleNext}
            className="nav-btn next-btn"
            disabled={isSubmitting}
          >
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="nav-btn complete-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Completing Setup...
              </>
            ) : (
              <>
                Complete Setup
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
