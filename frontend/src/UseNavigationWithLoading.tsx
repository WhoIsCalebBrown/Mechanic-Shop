import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import VehiclesPage from './pages/VehiclesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ServiceRecordsPage from './pages/ServiceRecordsPage';
import './App.css';

interface NavigationContextType {
  navigateWithLoading: (path: string, options?: { skipLoading?: boolean }) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useNavigationWithLoading = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationWithLoading must be used within NavigationProvider');
  }
  return context;
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [, setIsNavigating] = useState(false);

  const navigateWithLoading = (path: string, options?: { skipLoading?: boolean }) => {
    if (path === location.pathname) return;

    // Skip loading if explicitly requested or navigating to landing page
    const skipLoading = options?.skipLoading || path === '/';

    if (skipLoading) {
      // Navigate immediately without loading screen
      navigate(path);
    } else {
      // Show loading screen for transitions
      setPendingPath(path);
      setShowLoading(true);
      setIsNavigating(true);
    }
  };

  const handleLoadingEnterComplete = () => {
    // Slide-down animation complete, now navigate
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
      // Small delay to let the new page start rendering
      setTimeout(() => {
        setIsNavigating(false);
      }, 100);
    }
  };

  const handleLoadingComplete = () => {
    // Loading animation finished, can start exit
  };

  const handleLoadingExitComplete = () => {
    // Exit animation done, hide loading screen
    setShowLoading(false);
  };

  return (
    <NavigationContext.Provider value={{ navigateWithLoading }}>
      {showLoading && (
        <LoadingScreen
          onComplete={handleLoadingComplete}
          onExitComplete={handleLoadingExitComplete}
          onEnterComplete={handleLoadingEnterComplete}
        />
      )}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Onboarding - Protected but accessible to newly registered users */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Admin settings (Owner only) */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRoles={['Owner']}>
              <Layout>
                <AdminSettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Staff dashboard (All authenticated users) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <Layout>
                <VehiclesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Layout>
                <AppointmentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-records"
          element={
            <ProtectedRoute>
              <Layout>
                <ServiceRecordsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </NavigationContext.Provider>
  );
}

function UseNavigationWithLoading() {
  // Wrap app with AuthProvider for global auth state
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default UseNavigationWithLoading;
