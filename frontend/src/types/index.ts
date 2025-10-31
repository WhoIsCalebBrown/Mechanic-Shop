export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface Vehicle {
  id: number;
  customerId: number;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  createdAt: string;
}

export type AppointmentStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';

export interface Appointment {
  id: number;
  customerId: number;
  vehicleId: number;
  scheduledDate: string;
  serviceType: string;
  description?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ServiceRecord {
  id: number;
  vehicleId: number;
  serviceDate: string;
  serviceType: string;
  description: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  mileageAtService?: number;
  technicianName?: string;
  notes?: string;
  createdAt: string;
}

// DTOs for creating/updating (without id and timestamps)
export type CreateCustomer = Omit<Customer, 'id' | 'createdAt'>;
export type UpdateCustomer = Partial<CreateCustomer>;

export type CreateVehicle = Omit<Vehicle, 'id' | 'createdAt'>;
export type UpdateVehicle = Partial<CreateVehicle>;

export type CreateAppointment = Omit<Appointment, 'id' | 'createdAt' | 'completedAt'>;
export type UpdateAppointment = Partial<CreateAppointment>;

export type CreateServiceRecord = Omit<ServiceRecord, 'id' | 'createdAt' | 'totalCost'>;
export type UpdateServiceRecord = Partial<CreateServiceRecord>;

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  tenantId?: string;
  staffId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt?: string;
  user: AuthUser;
}

export interface TokenRefreshResponse {
  accessToken: string;
  expiresAt?: string;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

// Onboarding Wizard Types
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
  open: string; // HH:MM format (24-hour)
  close: string; // HH:MM format (24-hour)
}

export interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  timeSlots: TimeSlot[];
}

export interface BusinessProfile {
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  logoUrl?: string;
}

export interface ServiceArea {
  city: string;
  state: string;
  radiusMiles: number;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // in minutes
  basePrice?: number;
  category: string;
}

export interface OnboardingData {
  businessProfile: BusinessProfile;
  serviceArea: ServiceArea;
  operatingHours: DaySchedule[];
  selectedServices: ServiceTemplate[];
  slug?: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

// API types for onboarding completion
export interface CompleteOnboardingRequest {
  businessProfile: BusinessProfile;
  serviceArea: ServiceArea;
  operatingHours: DaySchedule[];
  selectedServices: ServiceTemplate[];
  slug: string;
}
