import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationWithLoading } from '../../UseNavigationWithLoading.tsx';
import FullScreenMenu from './FullScreenMenu';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { navigateWithLoading } = useNavigationWithLoading();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    // Skip loading screen for regular navbar navigation
    navigateWithLoading(path, { skipLoading: true });
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
            <a href="/admin/settings" onClick={(e) => handleNavClick(e, '/admin/settings')} className={isActive('/admin/settings') ? 'active' : ''}>
              Site Settings
            </a>
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
