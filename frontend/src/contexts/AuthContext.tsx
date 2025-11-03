import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, tokenManager } from '../services/auth';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (tokenManager.isTokenExpired(token)) {
        try {
          // Try to refresh the token
          await authApi.refreshToken();
          await loadUser();
        } catch (error) {
          console.error('Token refresh failed:', error);
          tokenManager.removeToken();
          setUser(null);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Load user data
      await loadUser();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loadUser = async () => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        console.log('[Auth] No token found');
        setUser(null);
        return;
      }

      console.log('[Auth] Token found, attempting to decode...');

      // Try to decode user from token first (faster, no API call needed)
      const decodedUser = authApi.decodeToken(token);
      if (decodedUser && decodedUser.id && decodedUser.email) {
        console.log('[Auth] User decoded from token:', decodedUser.email);
        setUser(decodedUser as AuthUser);
        return;
      }

      console.log('[Auth] Token decode failed, attempting API call...');

      // Fallback to API call if token decode fails
      try {
        const currentUser = await authApi.getCurrentUser();
        console.log('[Auth] User loaded from API:', currentUser.email);
        setUser(currentUser);
      } catch (apiError) {
        console.warn('[Auth] API call failed, but token exists. Keeping decoded user.', apiError);

        // If API fails but we have a valid token, try to use decoded data anyway
        if (decodedUser && decodedUser.id) {
          console.log('[Auth] Using partially decoded user data');
          setUser(decodedUser as AuthUser);
          return;
        }

        throw apiError; // Re-throw if we really can't get user data
      }
    } catch (error) {
      console.error('[Auth] Failed to load user, attempting token refresh:', error);

      // Try token refresh before removing token
      try {
        await authApi.refreshToken();
        const token = tokenManager.getToken();
        if (token) {
          const decodedUser = authApi.decodeToken(token);
          if (decodedUser && decodedUser.id) {
            console.log('[Auth] User restored after refresh:', decodedUser.email);
            setUser(decodedUser as AuthUser);
            return;
          }
        }
      } catch (refreshError) {
        console.error('[Auth] Token refresh failed, clearing auth state:', refreshError);
      }

      // Only clear token if all recovery attempts failed
      console.log('[Auth] All auth recovery attempts failed, logging out');
      tokenManager.removeToken();
      setUser(null);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
