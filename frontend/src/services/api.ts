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
import { tokenManager, authApi } from './auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

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

async function handleResponse<T>(response: Response, originalRequest?: () => Promise<Response>): Promise<T> {
  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401 && originalRequest) {
    console.log('[API] 401 Unauthorized - attempting token refresh');

    // If already refreshing, wait for that to complete
    if (isRefreshing && refreshPromise) {
      try {
        await refreshPromise;
        // Retry with new token
        console.log('[API] Token refreshed, retrying original request');
        const retryResponse = await originalRequest();
        return handleResponse<T>(retryResponse); // No retry on second attempt
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        // Redirect to login
        tokenManager.removeToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    // Start refresh process
    isRefreshing = true;
    refreshPromise = authApi.refreshToken()
      .then(() => {
        console.log('[API] Token refresh successful');
      })
      .catch((error) => {
        console.error('[API] Token refresh failed:', error);
        tokenManager.removeToken();
        window.location.href = '/login';
        throw error;
      })
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });

    try {
      await refreshPromise;
      // Retry original request with new token
      console.log('[API] Retrying original request with new token');
      const retryResponse = await originalRequest();
      return handleResponse<T>(retryResponse); // No retry on second attempt
    } catch (refreshError) {
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Customer API
export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/customers`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Customer[]>(response, makeRequest);
  },

  getById: async (id: number): Promise<Customer> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/customers/${id}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Customer>(response, makeRequest);
  },

  create: async (customer: CreateCustomer): Promise<Customer> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });
    const response = await makeRequest();
    return handleResponse<Customer>(response, makeRequest);
  },

  update: async (id: number, customer: UpdateCustomer): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },

  delete: async (id: number): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },
};

// Vehicle API
export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/vehicles`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Vehicle[]>(response, makeRequest);
  },

  getById: async (id: number): Promise<Vehicle> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/vehicles/${id}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Vehicle>(response, makeRequest);
  },

  getByCustomer: async (customerId: number): Promise<Vehicle[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/vehicles/customer/${customerId}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Vehicle[]>(response, makeRequest);
  },

  create: async (vehicle: CreateVehicle): Promise<Vehicle> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicle),
    });
    const response = await makeRequest();
    return handleResponse<Vehicle>(response, makeRequest);
  },

  update: async (id: number, vehicle: UpdateVehicle): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicle),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },

  delete: async (id: number): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },
};

// Appointment API
export const appointmentApi = {
  getAll: async (): Promise<Appointment[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/appointments`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Appointment[]>(response, makeRequest);
  },

  getById: async (id: number): Promise<Appointment> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/appointments/${id}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Appointment>(response, makeRequest);
  },

  getByCustomer: async (customerId: number): Promise<Appointment[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/appointments/customer/${customerId}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Appointment[]>(response, makeRequest);
  },

  getByVehicle: async (vehicleId: number): Promise<Appointment[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/appointments/vehicle/${vehicleId}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<Appointment[]>(response, makeRequest);
  },

  create: async (appointment: CreateAppointment): Promise<Appointment> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointment),
    });
    const response = await makeRequest();
    return handleResponse<Appointment>(response, makeRequest);
  },

  update: async (id: number, appointment: UpdateAppointment): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointment),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },

  delete: async (id: number): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },
};

// Service Record API
export const serviceRecordApi = {
  getAll: async (): Promise<ServiceRecord[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/servicerecords`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<ServiceRecord[]>(response, makeRequest);
  },

  getById: async (id: number): Promise<ServiceRecord> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<ServiceRecord>(response, makeRequest);
  },

  getByVehicle: async (vehicleId: number): Promise<ServiceRecord[]> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/servicerecords/vehicle/${vehicleId}`, {
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    return handleResponse<ServiceRecord[]>(response, makeRequest);
  },

  create: async (record: CreateServiceRecord): Promise<ServiceRecord> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/servicerecords`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    const response = await makeRequest();
    return handleResponse<ServiceRecord>(response, makeRequest);
  },

  update: async (id: number, record: UpdateServiceRecord): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(record),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },

  delete: async (id: number): Promise<void> => {
    const makeRequest = () => fetch(`${API_BASE_URL}/servicerecords/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const response = await makeRequest();
    await handleResponse<void>(response, makeRequest);
  },
};
