import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  OnboardingData,
  BusinessProfile,
  ServiceArea,
  DaySchedule,
  ServiceTemplate,
  DayOfWeek,
} from '../types';

interface OnboardingContextType {
  currentStep: number;
  onboardingData: OnboardingData;
  setCurrentStep: (step: number) => void;
  updateBusinessProfile: (data: Partial<BusinessProfile>) => void;
  updateServiceArea: (data: Partial<ServiceArea>) => void;
  updateOperatingHours: (hours: DaySchedule[]) => void;
  updateSelectedServices: (services: ServiceTemplate[]) => void;
  updateSlug: (slug: string) => void;
  resetOnboarding: () => void;
  canProceedToNextStep: () => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

// Default initial state
const getDefaultOperatingHours = (): DaySchedule[] => {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((day) => ({
    day,
    isOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
    timeSlots: [{ open: '09:00', close: '17:00' }],
  }));
};

const initialOnboardingData: OnboardingData = {
  businessProfile: {
    businessName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    logoUrl: '',
    country: 'US',
  },
  serviceArea: {
    city: '',
    state: '',
    radiusMiles: 25,
  },
  operatingHours: getDefaultOperatingHours(),
  selectedServices: [],
  slug: '',
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialOnboardingData);

  const updateBusinessProfile = (data: Partial<BusinessProfile>) => {
    setOnboardingData((prev) => {
      const updatedProfile = {
        ...prev.businessProfile,
        ...data,
      };

      // Auto-sync city and state to service area
      return {
        ...prev,
        businessProfile: updatedProfile,
        serviceArea: {
          ...prev.serviceArea,
          city: updatedProfile.city,
          state: updatedProfile.state,
        },
      };
    });
  };

  const updateServiceArea = (data: Partial<ServiceArea>) => {
    setOnboardingData((prev) => ({
      ...prev,
      serviceArea: {
        ...prev.serviceArea,
        ...data,
      },
    }));
  };

  const updateOperatingHours = (hours: DaySchedule[]) => {
    setOnboardingData((prev) => ({
      ...prev,
      operatingHours: hours,
    }));
  };

  const updateSelectedServices = (services: ServiceTemplate[]) => {
    setOnboardingData((prev) => ({
      ...prev,
      selectedServices: services,
    }));
  };

  const updateSlug = (slug: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      slug,
    }));
  };

  const resetOnboarding = () => {
    setOnboardingData(initialOnboardingData);
    setCurrentStep(1);
  };

  const canProceedToNextStep = (): boolean => {
    const { businessProfile, serviceArea, operatingHours } = onboardingData;

    switch (currentStep) {
      case 1: // Business Profile
        return !!(
          businessProfile.businessName.trim() &&
          businessProfile.address.trim() &&
          businessProfile.city.trim() &&
          businessProfile.state.trim() &&
          businessProfile.zipCode.trim() &&
          businessProfile.phone.trim()
        );

      case 2: // Service Area (simplified - only need radius now, city/state from business profile)
        return serviceArea.radiusMiles > 0;

      case 3: // Operating Hours
        // At least one day must be open
        return operatingHours.some((day) => day.isOpen);

      case 4: // Services (optional, can skip)
        return true;

      default:
        return false;
    }
  };

  const value: OnboardingContextType = {
    currentStep,
    onboardingData,
    setCurrentStep,
    updateBusinessProfile,
    updateServiceArea,
    updateOperatingHours,
    updateSelectedServices,
    updateSlug,
    resetOnboarding,
    canProceedToNextStep,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
