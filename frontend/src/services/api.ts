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
import { tokenManager } from './auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get headers with auth token
function getAuthHeaders(): HeadersInit {
  const token = tokenManager.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] Auth header added to request');
  } else {
    console.warn('[API] No token available, request will be unauthorized');
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

// Customer API
export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer>(response);
  },

  create: async (customer: CreateCustomer): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });
    return handleResponse<Customer>(response);
  },

  update: async (id: number, customer: UpdateCustomer): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

// Vehicle API
export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Vehicle[]>(response);
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Vehicle>(response);
  },

  getByCustomer: async (customerId: number): Promise<Vehicle[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/customer/${customerId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Vehicle[]>(response);
  },

  create: async (vehicle: CreateVehicle): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicle),
    });
    return handleResponse<Vehicle>(response);
  },

  update: async (id: number, vehicle: UpdateVehicle): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

// Appointment API
export const appointmentApi = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appointment[]>(response);
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appointment>(response);
  },

  getByCustomer: async (customerId: number): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments/customer/${customerId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appointment[]>(response);
  },

  getByVehicle: async (vehicleId: number): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments/vehicle/${vehicleId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appointment[]>(response);
  },

  create: async (appointment: CreateAppointment): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointment),
    });
    return handleResponse<Appointment>(response);
  },

  update: async (id: number, appointment: UpdateAppointment): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointment),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

// Service Record API
export const serviceRecordApi = {
  getAll: async (): Promise<ServiceRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ServiceRecord[]>(response);
  },

  getById: async (id: number): Promise<ServiceRecord> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ServiceRecord>(response);
  },

  getByVehicle: async (vehicleId: number): Promise<ServiceRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/vehicle/${vehicleId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ServiceRecord[]>(response);
  },

  create: async (record: CreateServiceRecord): Promise<ServiceRecord> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    return handleResponse<ServiceRecord>(response);
  },

  update: async (id: number, record: UpdateServiceRecord): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};
