import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationWithLoading } from '../../App';
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
    navigateWithLoading(path);
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Caleb's Mechanic Shop</h1>
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
        <ul className="nav-links">
          <li>
            <a href="/" onClick={(e) => handleNavClick(e, '/')} className={isActive('/') ? 'active' : ''}>
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
        </ul>
      </nav>
      <FullScreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
