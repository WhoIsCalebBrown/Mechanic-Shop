import { useEffect } from 'react';
import { useNavigationWithLoading } from '../../App';
import './FullScreenMenu.css';

interface FullScreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FullScreenMenu({ isOpen, onClose }: FullScreenMenuProps) {
  const { navigateWithLoading } = useNavigationWithLoading();

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/customers', label: 'Customers' },
    { path: '/vehicles', label: 'Vehicles' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/service-records', label: 'Service Records' },
  ];

  // Placeholder images - you can replace with your own
  const images = [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onClose();
    navigateWithLoading(path);
  };

  return (
    <div className={`fullscreen-menu ${isOpen ? 'open' : ''}`}>
      <div className="menu-background"></div>

      <div className="menu-content">
        <div className="menu-images">
          <div className="image-column column-1">
            <div className="menu-image">
              <img src={images[0]} alt="" />
            </div>
            <div className="menu-image">
              <img src={images[2]} alt="" />
            </div>
          </div>
          <div className="image-column column-2">
            <div className="menu-image">
              <img src={images[1]} alt="" />
            </div>
            <div className="menu-image">
              <img src={images[3]} alt="" />
            </div>
          </div>
        </div>

        <nav className="menu-nav">
          <ul className="menu-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <a
                  href={link.path}
                  className="menu-link"
                  onClick={(e) => handleLinkClick(e, link.path)}
                >
                  <span className="menu-link-text">{link.label}</span>
                  <div className="menu-link-underline"></div>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
