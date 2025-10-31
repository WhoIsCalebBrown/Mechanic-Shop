import { tokenManager } from './auth';

const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeaders(): HeadersInit {
  const token = tokenManager.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Backend types matching the DTOs
interface OnboardingStep1Request {
  businessName: string;
  slug?: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
}

interface AvailabilityRules {
  timezone: string;
  weeklySchedule: Record<string, DaySchedule | null>; // "Monday", "Tuesday", etc.
  slotDurationMinutes: number;
  bufferMinutes: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  closedDates: string[];
  specialDates: Record<string, DaySchedule>;
}

interface OnboardingStep2Request {
  availabilityRules: AvailabilityRules;
}

interface OnboardingStep3Request {
  serviceName: string;
  serviceDescription?: string;
  basePrice: number;
  durationMinutes: number;
  category: number; // ServiceCategory enum
}

interface CompleteOnboardingRequest {
  businessInfo: OnboardingStep1Request;
  availability: OnboardingStep2Request;
  firstService: OnboardingStep3Request;
}

interface OnboardingStatusResponse {
  isCompleted: boolean;
  currentStep: number;
  completedAt?: string;
  tenant?: {
    id: number;
    name: string;
    slug: string;
    bookingEnabled: boolean;
    serviceItemCount: number;
  };
  publicBookingUrl?: string;
}

export const onboardingApi = {
  // Get current onboarding status
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/onboarding/status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<OnboardingStatusResponse>(response);
  },

  // Complete all onboarding steps in one call
  complete: async (request: CompleteOnboardingRequest): Promise<OnboardingStatusResponse> => {
    console.log('[Onboarding] Submitting onboarding data:', request);
    const response = await fetch(`${API_BASE_URL}/onboarding/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<OnboardingStatusResponse>(response);
  },
};

// Helper to convert frontend onboarding data to backend request
export function convertOnboardingDataToRequest(data: {
  businessProfile: {
    businessName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email?: string;
  };
  serviceArea: {
    city: string;
    state: string;
    radiusMiles: number;
  };
  operatingHours: Array<{
    day: string;
    isOpen: boolean;
    timeSlots: Array<{ open: string; close: string }>;
  }>;
  selectedServices: Array<{
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
    basePrice?: number;
    category: string;
  }>;
}): CompleteOnboardingRequest {
  // Convert operating hours to the backend format
  const weeklySchedule: Record<string, DaySchedule | null> = {};
  data.operatingHours.forEach((daySchedule) => {
    if (daySchedule.isOpen && daySchedule.timeSlots.length > 0) {
      // Use the first time slot for simplicity (backend supports one open/close time per day)
      weeklySchedule[daySchedule.day] = {
        isOpen: true,
        openTime: daySchedule.timeSlots[0].open,
        closeTime: daySchedule.timeSlots[0].close,
      };
    } else {
      weeklySchedule[daySchedule.day] = { isOpen: false };
    }
  });

  // Pick the first service to send (or use a default)
  const firstService = data.selectedServices[0] || {
    name: 'General Service',
    description: 'General automotive service',
    estimatedDuration: 60,
    basePrice: 100,
    category: 'General',
  };

  // Map category to enum value (0 = General, 1 = Maintenance, etc.)
  const categoryMap: Record<string, number> = {
    General: 0,
    Maintenance: 1,
    Repair: 2,
    Diagnostic: 3,
    Inspection: 4,
    Specialty: 5,
  };

  return {
    businessInfo: {
      businessName: data.businessProfile.businessName,
      businessAddress: data.businessProfile.address,
      city: data.businessProfile.city,
      state: data.businessProfile.state,
      zipCode: data.businessProfile.zipCode,
      phone: data.businessProfile.phone,
      email: data.businessProfile.email,
    },
    availability: {
      availabilityRules: {
        timezone: 'America/Chicago', // Default timezone
        weeklySchedule,
        slotDurationMinutes: 30,
        bufferMinutes: 0,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        closedDates: [],
        specialDates: {},
      },
    },
    firstService: {
      serviceName: firstService.name,
      serviceDescription: firstService.description,
      basePrice: firstService.basePrice || 100,
      durationMinutes: firstService.estimatedDuration,
      category: categoryMap[firstService.category] || 0,
    },
  };
}
