import type { TenantSettings, UpdateTenantSettingsRequest } from '../types/settings';
import { tokenManager } from './auth';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const tenantSettingsApi = {
  // Get current tenant settings
  getSettings: async (): Promise<TenantSettings> => {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/tenant/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    return handleResponse<TenantSettings>(response);
  },

  // Update tenant settings
  updateSettings: async (settings: UpdateTenantSettingsRequest): Promise<TenantSettings> => {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/tenant/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    });

    return handleResponse<TenantSettings>(response);
  },

  // Upload logo
  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${API_BASE_URL}/tenant/logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    return handleResponse<{ logoUrl: string }>(response);
  },
};
