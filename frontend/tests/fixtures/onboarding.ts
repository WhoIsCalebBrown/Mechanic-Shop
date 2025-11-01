/**
 * Test fixtures and data for onboarding tests
 */

export const testBusinessProfile = {
  name: 'Test Auto Repair Shop',
  street: '123 Main Street',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  phone: '5125551234',
  phoneFormatted: '(512) 555-1234',
  email: 'test@autorepair.com',
};

export const testServiceArea = {
  city: 'Austin',
  state: 'TX',
  radius: 25,
};

export const testOperatingHours = {
  monday: { open: '09:00', close: '17:00' },
  tuesday: { open: '09:00', close: '17:00' },
  wednesday: { open: '09:00', close: '17:00' },
  thursday: { open: '09:00', close: '17:00' },
  friday: { open: '09:00', close: '17:00' },
  saturday: { open: '10:00', close: '14:00' },
  sunday: { open: '', close: '' }, // Closed
};

export const testServices = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Engine Diagnostic',
];

export const serviceCategories = [
  'All',
  'Maintenance',
  'Inspection',
  'Diagnostic',
  'Repair',
];

/**
 * Complete onboarding data for full flow test
 */
export const completeOnboardingData = {
  businessProfile: testBusinessProfile,
  serviceArea: testServiceArea,
  operatingHours: testOperatingHours,
  services: testServices,
};

/**
 * Invalid data for validation testing
 */
export const invalidBusinessProfile = {
  empty: {
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  },
  invalidZip: {
    name: 'Test Shop',
    street: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '123', // Too short
    phone: '5125551234',
  },
  invalidPhone: {
    name: 'Test Shop',
    street: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '123', // Too short
  },
};
