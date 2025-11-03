import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PublicBookingPage.css';

// Types based on backend PublicBookingPageDto
interface PublicBookingData {
  profile: {
    businessName: string;
    slug: string;
    bio?: string;
    description?: string;
    location: {
      fullAddress: string;
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      area?: string;
    };
    contact: {
      phone?: string;
      email?: string;
      formattedPhone?: string;
    };
    logoUrl?: string;
    website?: string;
  };
  services: Array<{
    id: number;
    name: string;
    description?: string;
    basePrice: number;
    formattedPrice: string;
    durationMinutes: number;
    formattedDuration: string;
    category: string;
  }>;
  availability: {
    timezone: string;
    weeklyHours: Record<string, {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
      formattedHours: string;
    }>;
    closedDates: string[];
    specialHours: Record<string, any>;
    bookingRules: {
      slotDurationMinutes: number;
      maxAdvanceBookingDays: number;
      minAdvanceBookingHours: number;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    canonicalUrl: string;
    openGraph: {
      type: string;
      title: string;
      description: string;
      url: string;
      image?: string;
      siteName: string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      image?: string;
    };
    structuredData: string;
  };
}

const PublicBookingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [bookingData, setBookingData] = useState<PublicBookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentMonth] = useState(new Date());

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const tenantSlug = slug || 'caleb'; // Default for testing

        const response = await fetch(`http://localhost:5000/api/book/${tenantSlug}/v2`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Shop not found or booking is not enabled');
        }

        const data = await response.json();
        setBookingData(data);

        // Set SEO meta tags
        document.title = data.seo.title;

        // Update or create meta tags
        updateMetaTag('description', data.seo.description);
        updateMetaTag('keywords', data.seo.keywords);

        // OpenGraph tags
        updateMetaTag('og:type', data.seo.openGraph.type, 'property');
        updateMetaTag('og:title', data.seo.openGraph.title, 'property');
        updateMetaTag('og:description', data.seo.openGraph.description, 'property');
        updateMetaTag('og:url', data.seo.openGraph.url, 'property');
        if (data.seo.openGraph.image) {
          updateMetaTag('og:image', data.seo.openGraph.image, 'property');
        }

        // Twitter Card tags
        updateMetaTag('twitter:card', data.seo.twitter.card, 'name');
        updateMetaTag('twitter:title', data.seo.twitter.title, 'name');
        updateMetaTag('twitter:description', data.seo.twitter.description, 'name');
        if (data.seo.twitter.image) {
          updateMetaTag('twitter:image', data.seo.twitter.image, 'name');
        }

        // Structured Data (JSON-LD)
        const scriptId = 'structured-data-ld';
        let script = document.getElementById(scriptId) as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script') as HTMLScriptElement;
          script.id = scriptId;
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.textContent = data.seo.structuredData;

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking page');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [slug]);

  const updateMetaTag = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
    let element = document.querySelector(`meta[${attr}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="loading-spinner"></div>
        <p>Loading booking page...</p>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="booking-error">
        <h1>Booking Not Available</h1>
        <p>{error || 'The booking page you\'re looking for is not available.'}</p>
      </div>
    );
  }

  const { profile, services, availability } = bookingData;
  const calendarDays = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="public-booking-page">
      {/* Header with Navigation */}
      <header className="booking-header" role="banner">
        <div className="header-container">
          <div className="header-logo-section">
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt={`${profile.businessName} logo`}
                className="header-logo"
              />
            )}
            <h1 className="header-business-name">{profile.businessName}</h1>
          </div>

          <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#calendar" onClick={() => setMobileMenuOpen(false)}>Availability</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </nav>

          <div className="header-contact-info">
            {profile.contact.formattedPhone && (
              <a href={`tel:${profile.contact.phone}`} className="header-phone">
                {profile.contact.formattedPhone}
              </a>
            )}
            <a href="#contact" className="cta-button primary">Book Appointment</a>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="booking-hero" role="region" aria-label="Hero section">
        <div className="hero-container">
          <div className="hero-content">
            <h2 className="hero-title">Book Your Service Online</h2>
            <p className="hero-description">
              {profile.description || profile.bio || `Professional auto repair services in ${profile.location.area}`}
            </p>
            <div className="hero-badge">
              <span className="badge-icon">📍</span>
              <span className="badge-text">{profile.location.area}</span>
            </div>
          </div>
          <div className="hero-image-placeholder">
            {/* Placeholder for shop photo - will be added when image upload is implemented */}
            <div className="placeholder-content">
              <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Car icon */}
                <g transform="translate(60, 80)">
                  {/* Car body */}
                  <path d="M0 30 L10 10 L40 10 L50 20 L100 20 L110 10 L140 10 L150 30 L150 60 L140 70 L10 70 L0 60 Z"
                        fill="#d1d1d1" stroke="#999" strokeWidth="2"/>
                  {/* Windows */}
                  <rect x="15" y="15" width="30" height="20" rx="2" fill="#e8e8e8"/>
                  <rect x="105" y="15" width="30" height="20" rx="2" fill="#e8e8e8"/>
                  {/* Wheels */}
                  <circle cx="35" cy="70" r="12" fill="#666" stroke="#333" strokeWidth="2"/>
                  <circle cx="35" cy="70" r="6" fill="#999"/>
                  <circle cx="115" cy="70" r="12" fill="#666" stroke="#333" strokeWidth="2"/>
                  <circle cx="115" cy="70" r="6" fill="#999"/>
                  {/* Details */}
                  <rect x="70" y="25" width="10" height="15" rx="1" fill="#e8e8e8"/>
                  <line x1="50" y1="45" x2="100" y2="45" stroke="#999" strokeWidth="2"/>
                </g>
                {/* Wrench icon */}
                <g transform="translate(40, 150)">
                  <path d="M5 0 L15 10 L10 15 L0 5 Z M15 10 L25 20 L20 25 L10 15 Z"
                        fill="#f50538" opacity="0.3"/>
                </g>
                {/* Text */}
                <text x="120" y="200" fontFamily="Arial, sans-serif" fontSize="14" fill="#999" textAnchor="middle" fontWeight="500">
                  Professional Auto Repair
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section" role="region" aria-label="Available services">
        <div className="section-container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Choose from our range of professional auto repair services</p>

          <div className="services-grid">
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h3 className="service-name">{service.name}</h3>
                    <span className="service-category">{service.category}</span>
                  </div>
                  {service.description && (
                    <p className="service-description">{service.description}</p>
                  )}
                  <div className="service-details">
                    <div className="service-detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{service.formattedDuration}</span>
                    </div>
                    <div className="service-detail-item">
                      <span className="detail-label">Starting at:</span>
                      <span className="detail-value price">{service.formattedPrice}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-services">No services available for online booking at this time.</p>
            )}
          </div>
        </div>
      </section>

      {/* Calendar Section (Placeholder) */}
      <section id="calendar" className="calendar-section" role="region" aria-label="Availability calendar">
        <div className="section-container">
          <h2 className="section-title">Check Availability</h2>
          <p className="section-subtitle">View our available time slots (interactive booking coming soon)</p>

          <div className="calendar-container">
            <div className="calendar-header">
              <h3 className="calendar-month">{monthName}</h3>
            </div>

            <div className="calendar-grid">
              <div className="calendar-day-header">Sun</div>
              <div className="calendar-day-header">Mon</div>
              <div className="calendar-day-header">Tue</div>
              <div className="calendar-day-header">Wed</div>
              <div className="calendar-day-header">Thu</div>
              <div className="calendar-day-header">Fri</div>
              <div className="calendar-day-header">Sat</div>

              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                }

                const isToday = day.getTime() === today.getTime();
                const isPast = day < today;
                const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'long' });
                const daySchedule = availability.weeklyHours[dayOfWeek];
                const isOpen = daySchedule?.isOpen ?? false;

                return (
                  <div
                    key={day.toISOString()}
                    className={`calendar-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${isOpen && !isPast ? 'available' : 'unavailable'}`}
                  >
                    <span className="day-number">{day.getDate()}</span>
                    {!isPast && (
                      <span className="day-status">
                        {isOpen ? '✓' : '✕'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color available"></span>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="legend-color unavailable"></span>
                <span>Closed</span>
              </div>
              <div className="legend-item">
                <span className="legend-color today"></span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section" role="region" aria-label="Contact information">
        <div className="section-container">
          <h2 className="section-title">Visit Us</h2>

          <div className="contact-grid">
            <div className="contact-info">
              <h3>Get in Touch</h3>

              <div className="info-group">
                <h4>Address</h4>
                <p>{profile.location.fullAddress}</p>
              </div>

              {profile.contact.formattedPhone && (
                <div className="info-group">
                  <h4>Phone</h4>
                  <p>
                    <a href={`tel:${profile.contact.phone}`}>{profile.contact.formattedPhone}</a>
                  </p>
                </div>
              )}

              {profile.contact.email && (
                <div className="info-group">
                  <h4>Email</h4>
                  <p>
                    <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
                  </p>
                </div>
              )}

              <div className="info-group">
                <h4>Business Hours</h4>
                <ul className="hours-list">
                  {Object.entries(availability.weeklyHours).map(([day, hours]) => (
                    <li key={day}>
                      <span className="day-name">{day}:</span>
                      <span className={`day-hours ${!hours.isOpen ? 'closed' : ''}`}>
                        {hours.formattedHours}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="map-container">
              <h3>Location</h3>
              <div className="map-embed">
                {/* Google Maps Embed */}
                {profile.location.fullAddress && (
                  <iframe
                    title="Shop location map"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(profile.location.fullAddress)}`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                )}
                <div className="map-placeholder">
                  <p>Map will display when Google Maps API key is configured</p>
                  <p className="map-placeholder-address">{profile.location.fullAddress}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location.fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="booking-footer" role="contentinfo">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} {profile.businessName}. All rights reserved.</p>
          {profile.website && (
            <p>
              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                Visit our website
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default PublicBookingPage;
