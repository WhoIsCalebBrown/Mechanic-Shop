import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshResponse,
  AuthUser,
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Token management
const TOKEN_KEY = 'auth_token';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  },
};

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse<AuthResponse>(response);

    // Store the access token
    if (data.token) {
      tokenManager.setToken(data.token);
    }

    return data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify(data),
    });
    const authResponse = await handleResponse<AuthResponse>(response);

    // Store the access token
    if (authResponse.token) {
      tokenManager.setToken(authResponse.token);
    }

    return authResponse;
  },

  logout: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenManager.getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Logout request failed, but will clear local state');
      }
    } finally {
      // Always clear local token, even if the API call fails
      tokenManager.removeToken();
    }
  },

  refreshToken: async (): Promise<TokenRefreshResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send refresh token cookie
    });
    const data = await handleResponse<TokenRefreshResponse>(response);

    // Update the access token
    if (data.token) {
      tokenManager.setToken(data.token);
    }

    return data;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const token = tokenManager.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    return handleResponse<AuthUser>(response);
  },

  // Decode user information from JWT token (client-side only, for display purposes)
  decodeToken: (token: string): Partial<AuthUser> | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.userId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        roles: payload.role ? (Array.isArray(payload.role) ? payload.role : [payload.role]) : [],
        tenantId: payload.tenantId,
        staffId: payload.staffId,
      };
    } catch {
      return null;
    }
  },
};

// Password validation utilities
export const passwordValidation = {
  // Calculate password strength
  calculateStrength: (password: string): { score: number; strength: 'weak' | 'fair' | 'good' | 'strong' } => {
    let score = 0;

    if (!password) return { score: 0, strength: 'weak' };

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[0-9]/.test(password)) score++; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score++; // special chars

    // Determine strength
    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 2) strength = 'weak';
    else if (score <= 3) strength = 'fair';
    else if (score <= 4) strength = 'good';
    else strength = 'strong';

    return { score, strength };
  },

  // Validate password meets minimum requirements
  meetsRequirements: (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  },

  // Get validation error message
  getErrorMessage: (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  },
};

// Email validation utility
export const emailValidation = {
  isValid: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  getErrorMessage: (email: string): string | null => {
    if (!email) {
      return 'Email is required';
    }
    if (!emailValidation.isValid(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  },
};
