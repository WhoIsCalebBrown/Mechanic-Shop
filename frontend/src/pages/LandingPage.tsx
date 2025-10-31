import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

interface SiteSettings {
  businessName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  mondayFridayHours: string;
  saturdayHours: string;
  sundayHours: string;
  vehiclesServiced: number;
  satisfactionRate: number;
  yearsExperience: number;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  service1Title: string;
  service1Description: string;
  service1Feature1: string;
  service1Feature2: string;
  service1Feature3: string;
  service1Feature4: string;
  service1ImageUrl: string | null;
  service2Title: string;
  service2Description: string;
  service2Feature1: string;
  service2Feature2: string;
  service2Feature3: string;
  service2Feature4: string;
  service2ImageUrl: string | null;
  service3Title: string;
  service3Description: string;
  service3Feature1: string;
  service3Feature2: string;
  service3Feature3: string;
  service3Feature4: string;
  service3ImageUrl: string | null;
  whyFeature1Title: string;
  whyFeature1Description: string;
  whyFeature2Title: string;
  whyFeature2Description: string;
  whyFeature3Title: string;
  whyFeature3Description: string;
  whyFeature4Title: string;
  whyFeature4Description: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
}

const LandingPage = () => {
  const statsRef = useRef<HTMLElement>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sitesettings');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        const element = document.getElementById(id!);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    // Intersection observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Animated counters - start after page load
    const timeout = setTimeout(() => {
      if (statsRef.current) {
        const counters = statsRef.current.querySelectorAll('.stat-number');
        counters.forEach((counter) => {
          const target = parseInt(counter.getAttribute('data-count') || '0');
          let count = 0;
          const increment = target / 60; // 60 frames for smooth animation
          const duration = 2000; // 2 seconds
          const stepTime = duration / 60;

          const updateCounter = () => {
            count += increment;
            if (count < target) {
              counter.textContent = Math.floor(count).toString();
              setTimeout(updateCounter, stepTime);
            } else {
              counter.textContent = target.toString();
            }
          };

          updateCounter();
        });
      }
    }, 500); // Start after 0.5s delay

    return () => clearTimeout(timeout);
  }, [settings]);

  if (!settings) {
    return <div className="landing-loading">Loading...</div>;
  }

  const heroTitleLines = settings.heroTitle.split('\n');

  const handleStaffPortalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Floating Staff Portal Button */}
      <a href="#" onClick={handleStaffPortalClick} className="staff-portal-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Staff Portal</span>
      </a>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            {heroTitleLines.map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < heroTitleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="hero-subtitle">{settings.heroSubtitle}</p>
          <div className="hero-cta">
            <button className="btn-primary">{settings.primaryCtaText}</button>
            <a href="#services" className="btn-secondary">{settings.secondaryCtaText}</a>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number" data-count={settings.vehiclesServiced}>0</span>
            <span className="stat-label">Vehicles Serviced</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" data-count={settings.satisfactionRate}>0</span>
            <span className="stat-label">% Satisfaction Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" data-count={settings.yearsExperience}>0</span>
            <span className="stat-label">Years Experience</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Comprehensive automotive care tailored to your needs</p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-image-container">
              <img
                src={settings.service1ImageUrl || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80"}
                alt={settings.service1Title}
                className="service-image"
              />
            </div>
            <div className="service-content">
              <h3 className="service-title">{settings.service1Title}</h3>
              <p className="service-description">{settings.service1Description}</p>
              <ul className="service-features">
                <li>{settings.service1Feature1}</li>
                <li>{settings.service1Feature2}</li>
                <li>{settings.service1Feature3}</li>
                <li>{settings.service1Feature4}</li>
              </ul>
            </div>
          </div>

          <div className="service-card">
            <div className="service-image-container">
              <img
                src={settings.service2ImageUrl || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80"}
                alt={settings.service2Title}
                className="service-image"
              />
            </div>
            <div className="service-content">
              <h3 className="service-title">{settings.service2Title}</h3>
              <p className="service-description">{settings.service2Description}</p>
              <ul className="service-features">
                <li>{settings.service2Feature1}</li>
                <li>{settings.service2Feature2}</li>
                <li>{settings.service2Feature3}</li>
                <li>{settings.service2Feature4}</li>
              </ul>
            </div>
          </div>

          <div className="service-card">
            <div className="service-image-container">
              <img
                src={settings.service3ImageUrl || "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80"}
                alt={settings.service3Title}
                className="service-image"
              />
            </div>
            <div className="service-content">
              <h3 className="service-title">{settings.service3Title}</h3>
              <p className="service-description">{settings.service3Description}</p>
              <ul className="service-features">
                <li>{settings.service3Feature1}</li>
                <li>{settings.service3Feature2}</li>
                <li>{settings.service3Feature3}</li>
                <li>{settings.service3Feature4}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="why-container">
          <div className="why-content">
            <h2 className="section-title">Why Choose Us</h2>
            <div className="why-features">
              <div className="why-feature">
                <div className="feature-number">01</div>
                <div className="feature-content">
                  <h3>{settings.whyFeature1Title}</h3>
                  <p>{settings.whyFeature1Description}</p>
                </div>
              </div>
              <div className="why-feature">
                <div className="feature-number">02</div>
                <div className="feature-content">
                  <h3>{settings.whyFeature2Title}</h3>
                  <p>{settings.whyFeature2Description}</p>
                </div>
              </div>
              <div className="why-feature">
                <div className="feature-number">03</div>
                <div className="feature-content">
                  <h3>{settings.whyFeature3Title}</h3>
                  <p>{settings.whyFeature3Description}</p>
                </div>
              </div>
              <div className="why-feature">
                <div className="feature-number">04</div>
                <div className="feature-content">
                  <h3>{settings.whyFeature4Title}</h3>
                  <p>{settings.whyFeature4Description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">{settings.ctaTitle}</h2>
          <p className="cta-subtitle">{settings.ctaSubtitle}</p>
          <button className="btn-primary btn-large">{settings.ctaButtonText}</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact</h3>
            <p>{settings.address}</p>
            <p>{settings.city}, {settings.state} {settings.zipCode}</p>
            <p>Phone: {settings.phone}</p>
            <p>Email: {settings.email}</p>
          </div>
          <div className="footer-section">
            <h3>Hours</h3>
            <p>Monday - Friday: {settings.mondayFridayHours}</p>
            <p>Saturday: {settings.saturdayHours}</p>
            <p>Sunday: {settings.sundayHours}</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <a href="#services">Services</a>
            <a href="#home">Home</a>
            <a href="#" onClick={handleStaffPortalClick}>Staff Portal</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 {settings.businessName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
