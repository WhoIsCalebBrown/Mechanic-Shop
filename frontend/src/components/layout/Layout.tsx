import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationWithLoading } from '../../UseNavigationWithLoading.tsx';
import { useAuth } from '../../contexts/AuthContext';
import FullScreenMenu from './FullScreenMenu';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateWithLoading } = useNavigationWithLoading();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    // Skip loading screen for regular navbar navigation
    navigateWithLoading(path, { skipLoading: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Caleb's Mechanic Shop</h1>
          <div className="nav-brand-actions">
            <a href="/" className="view-landing-btn" title="View Landing Page">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Landing Page</span>
            </a>
            <button
              className={`hamburger ${menuOpen ? 'hidden' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        <ul className="nav-links">
          <li>
            <a href="/dashboard" onClick={(e) => handleNavClick(e, '/dashboard')} className={isActive('/dashboard') ? 'active' : ''}>
              Dashboard
            </a>
          </li>
          <li>
            <a href="/customers" onClick={(e) => handleNavClick(e, '/customers')} className={isActive('/customers') ? 'active' : ''}>
              Customers
            </a>
          </li>
          <li>
            <a href="/vehicles" onClick={(e) => handleNavClick(e, '/vehicles')} className={isActive('/vehicles') ? 'active' : ''}>
              Vehicles
            </a>
          </li>
          <li>
            <a href="/appointments" onClick={(e) => handleNavClick(e, '/appointments')} className={isActive('/appointments') ? 'active' : ''}>
              Appointments
            </a>
          </li>
          <li>
            <a href="/service-records" onClick={(e) => handleNavClick(e, '/service-records')} className={isActive('/service-records') ? 'active' : ''}>
              Service Records
            </a>
          </li>
          <li>
            <a href="/settings" onClick={(e) => handleNavClick(e, '/settings')} className={isActive('/settings') ? 'active' : ''}>
              Settings
            </a>
          </li>
          <li>
            <a href="/admin/settings" onClick={(e) => handleNavClick(e, '/admin/settings')} className={isActive('/admin/settings') ? 'active' : ''}>
              Site Settings
            </a>
          </li>
          <li className="user-menu-container">
            <button
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.email}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={`dropdown-icon ${showUserMenu ? 'open' : ''}`}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p className="user-email">{user?.email}</p>
                  {user?.roles && user.roles.length > 0 && (
                    <p className="user-role">{user.roles.join(', ')}</p>
                  )}
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="logout-button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="16 17 21 12 16 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="21"
                      y1="12"
                      x2="9"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
      {menuOpen && <FullScreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
