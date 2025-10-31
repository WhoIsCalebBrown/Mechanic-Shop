import React from 'react';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import './OnboardingPage.css';

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <div className="onboarding-page">
        <div className="onboarding-header">
          <div className="header-content">
            <h1>Welcome to Your Auto Shop Dashboard</h1>
            <p>Let's get your business set up in just a few steps</p>
          </div>
        </div>

        <div className="onboarding-container">
          <OnboardingWizard />
        </div>
      </div>
    </OnboardingProvider>
  );
}
