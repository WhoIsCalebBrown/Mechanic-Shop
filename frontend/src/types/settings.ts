export interface TenantSettings {
  id: number;
  slug: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  timezone: string;
  branding: BrandingSettings;
  notifications: NotificationPreferences;
  availability: AvailabilitySettings;
}

export interface BrandingSettings {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
}

export interface NotificationPreferences {
  newBookingEmail: boolean;
  newBookingSms: boolean;
  paymentReceivedEmail: boolean;
  paymentReceivedSms: boolean;
  appointmentReminderEmail: boolean;
  appointmentReminderSms: boolean;
  cancellationEmail: boolean;
  cancellationSms: boolean;
}

export interface AvailabilitySettings {
  weeklySchedule: DaySchedule[];
  holidayOverrides: HolidayOverride[];
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  isOpen: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
}

export interface HolidayOverride {
  id?: number;
  date: string; // YYYY-MM-DD format
  name: string;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
}

export type UpdateTenantSettingsRequest = Partial<Omit<TenantSettings, 'id' | 'slug'>>;
