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
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs to complete onboarding
  // Users without tenantId need to complete onboarding (except when already on onboarding page)
  // TenantId is nested in user.staff.tenantId from the API response
  const hasTenant = user?.tenantId || user?.staff?.tenantId;

  if (location.pathname !== '/onboarding' && user && !hasTenant) {
    console.log('[ProtectedRoute] User has no tenant, redirecting to onboarding');
    console.log('[ProtectedRoute] User object:', user);
    console.log('[ProtectedRoute] User tenantId:', hasTenant);
    return <Navigate to="/onboarding" replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => user?.roles.includes(role));

    if (!hasRequiredRole) {
      // Redirect to dashboard or unauthorized page if user doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
