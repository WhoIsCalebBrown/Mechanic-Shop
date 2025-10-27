import type {
  Customer,
  CreateCustomer,
  UpdateCustomer,
  Vehicle,
  CreateVehicle,
  UpdateVehicle,
  Appointment,
  CreateAppointment,
  UpdateAppointment,
  ServiceRecord,
  CreateServiceRecord,
  UpdateServiceRecord,
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Customer API
export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers`);
    return handleResponse<Customer[]>(response);
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    return handleResponse<Customer>(response);
  },

  create: async (customer: CreateCustomer): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    return handleResponse<Customer>(response);
  },

  update: async (id: number, customer: UpdateCustomer): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

// Vehicle API
export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    return handleResponse<Vehicle[]>(response);
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
    return handleResponse<Vehicle>(response);
  },

  getByCustomer: async (customerId: number): Promise<Vehicle[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/customer/${customerId}`);
    return handleResponse<Vehicle[]>(response);
  },

  create: async (vehicle: CreateVehicle): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    });
    return handleResponse<Vehicle>(response);
  },

  update: async (id: number, vehicle: UpdateVehicle): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

// Appointment API
export const appointmentApi = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    return handleResponse<Appointment[]>(response);
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`);
    return handleResponse<Appointment>(response);
  },

  getByCustomer: async (customerId: number): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments/customer/${customerId}`);
    return handleResponse<Appointment[]>(response);
  },

  getByVehicle: async (vehicleId: number): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments/vehicle/${vehicleId}`);
    return handleResponse<Appointment[]>(response);
  },

  create: async (appointment: CreateAppointment): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    return handleResponse<Appointment>(response);
  },

  update: async (id: number, appointment: UpdateAppointment): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

// Service Record API
export const serviceRecordApi = {
  getAll: async (): Promise<ServiceRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords`);
    return handleResponse<ServiceRecord[]>(response);
  },

  getById: async (id: number): Promise<ServiceRecord> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/${id}`);
    return handleResponse<ServiceRecord>(response);
  },

  getByVehicle: async (vehicleId: number): Promise<ServiceRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/vehicle/${vehicleId}`);
    return handleResponse<ServiceRecord[]>(response);
  },

  create: async (record: CreateServiceRecord): Promise<ServiceRecord> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return handleResponse<ServiceRecord>(response);
  },

  update: async (id: number, record: UpdateServiceRecord): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};
