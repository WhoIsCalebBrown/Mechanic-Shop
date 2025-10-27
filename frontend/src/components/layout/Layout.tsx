import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Caleb's Mechanic Shop</h1>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/customers" className={isActive('/customers') ? 'active' : ''}>
              Customers
            </Link>
          </li>
          <li>
            <Link to="/vehicles" className={isActive('/vehicles') ? 'active' : ''}>
              Vehicles
            </Link>
          </li>
          <li>
            <Link to="/appointments" className={isActive('/appointments') ? 'active' : ''}>
              Appointments
            </Link>
          </li>
          <li>
            <Link to="/service-records" className={isActive('/service-records') ? 'active' : ''}>
              Service Records
            </Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
