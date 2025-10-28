import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/LoadingScreen';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import VehiclesPage from './pages/VehiclesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ServiceRecordsPage from './pages/ServiceRecordsPage';
import './App.css';

interface NavigationContextType {
  navigateWithLoading: (path: string) => void;
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

  const navigateWithLoading = (path: string) => {
    if (path === location.pathname) return;
    setPendingPath(path);
    setShowLoading(true);
  };

  const handleLoadingEnterComplete = () => {
    // Slide-down animation complete, now navigate
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
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
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/service-records" element={<ServiceRecordsPage />} />
        </Routes>
      </Layout>
    </NavigationContext.Provider>
  );
}

function App() {
  const [showInitialLoading, setShowInitialLoading] = useState(true);

  return (
    <>
      {showInitialLoading && <LoadingScreen onComplete={() => setShowInitialLoading(false)} />}
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
