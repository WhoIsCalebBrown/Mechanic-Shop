import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
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
        {/* Public landing page without dashboard layout */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin settings page with layout */}
        <Route path="/admin/settings" element={<Layout><AdminSettingsPage /></Layout>} />

        {/* Staff dashboard routes with layout */}
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/customers" element={<Layout><CustomersPage /></Layout>} />
        <Route path="/vehicles" element={<Layout><VehiclesPage /></Layout>} />
        <Route path="/appointments" element={<Layout><AppointmentsPage /></Layout>} />
        <Route path="/service-records" element={<Layout><ServiceRecordsPage /></Layout>} />
      </Routes>
    </NavigationContext.Provider>
  );
}

function UseNavigationWithLoading() {
  // Remove initial loading screen - it's not needed
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default UseNavigationWithLoading;
