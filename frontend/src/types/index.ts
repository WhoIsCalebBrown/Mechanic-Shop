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
