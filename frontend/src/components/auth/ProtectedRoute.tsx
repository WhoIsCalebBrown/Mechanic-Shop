import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading screen while checking auth status
  if (isLoading) {
    return <LoadingScreen onComplete={() => {}} />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs to complete onboarding
  // Users without tenantId need to complete onboarding (except when already on onboarding page)
  // Check both staff.tenantId (from /auth/me API) and tenantId (from JWT decode)
  const hasTenant = user?.staff?.tenantId || user?.tenantId;

  if (location.pathname !== '/onboarding' && user && !hasTenant) {
    console.log('[ProtectedRoute] User has no tenant, redirecting to onboarding');
    console.log('[ProtectedRoute] User object:', user);
    console.log('[ProtectedRoute] Staff tenantId:', user?.staff?.tenantId);
    console.log('[ProtectedRoute] JWT tenantId:', user?.tenantId);
    return <Navigate to="/onboarding" replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles && requiredRoles.length > 0) {
    // Get roles from either staff.role or roles array (from JWT decode)
    const userRoles = user?.roles || (user?.staff?.role ? [user.staff.role] : []);
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] User does not have required role. Required:', requiredRoles, 'User has:', userRoles);
      // Redirect to dashboard or unauthorized page if user doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
