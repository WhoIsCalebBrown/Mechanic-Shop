import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PublicLandingPage.css';

// This will be available after type generation
interface PublicSiteSettings {
  businessName: string;
  tagline: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logoUrl?: string;
  primaryColor?: string;
  vehiclesServiced: number;
  satisfactionRate: number;
  yearsExperience: number;
  heroTitle?: string;
  heroSubtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  heroImageUrl?: string;
  service1Title?: string;
  service1Description?: string;
  service1Feature1?: string;
  service1Feature2?: string;
  service1Feature3?: string;
  service1Feature4?: string;
  service1ImageUrl?: string;
  service2Title?: string;
  service2Description?: string;
  service2Feature1?: string;
  service2Feature2?: string;
  service2Feature3?: string;
  service2Feature4?: string;
  service2ImageUrl?: string;
  service3Title?: string;
  service3Description?: string;
  service3Feature1?: string;
  service3Feature2?: string;
  service3Feature3?: string;
  service3Feature4?: string;
  service3ImageUrl?: string;
  whyFeature1Title?: string;
  whyFeature1Description?: string;
  whyFeature2Title?: string;
  whyFeature2Description?: string;
  whyFeature3Title?: string;
  whyFeature3Description?: string;
  whyFeature4Title?: string;
  whyFeature4Description?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonText?: string;
  businessHours: Array<{
    day: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
  bookingEnabled: boolean;
  timeZone: string;
}

const PublicLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [settings, setSettings] = useState<PublicSiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredService: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In production, extract slug from subdomain
        // For development, use URL parameter or default
        const tenantSlug = slug || 'caleb'; // Default for testing

        const response = await fetch(`http://localhost:5000/api/public/${tenantSlug}`);

        if (!response.ok) {
          throw new Error('Shop not found');
        }

        const data = await response.json();
        setSettings(data);

        // Set custom CSS variables for branding
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--brand-color', data.primaryColor);
        }

        // Set page title
        document.title = `${data.businessName} - ${data.tagline}`;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shop');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [slug]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/public/${slug || 'caleb'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setFormSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', message: '', preferredService: '' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="public-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="public-error">
        <h1>Shop Not Found</h1>
        <p>{error || 'The shop you\'re looking for doesn\'t exist or is no longer active.'}</p>
      </div>
    );
  }

  return (
    <div className="public-landing-page">
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          backgroundImage: settings.heroImageUrl ? `url(${settings.heroImageUrl})` : undefined
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt={`${settings.businessName} logo`} className="hero-logo" />
            )}
            <h1 className="hero-title">
              {(settings.heroTitle || settings.businessName).split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </h1>
            <p className="hero-subtitle">{settings.heroSubtitle || settings.tagline}</p>
            <div className="hero-cta">
              <a href="#contact" className="cta-button primary">
                {settings.primaryCtaText || 'Schedule Service'}
              </a>
              <a href="#services" className="cta-button secondary">
                {settings.secondaryCtaText || 'Our Services'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{settings.vehiclesServiced.toLocaleString()}+</div>
              <div className="stat-label">Vehicles Serviced</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{settings.satisfactionRate}%</div>
              <div className="stat-label">Customer Satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{settings.yearsExperience}+</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {/* Service 1 */}
            {settings.service1Title && (
              <div className="service-card">
                {settings.service1ImageUrl && (
                  <img src={settings.service1ImageUrl} alt={settings.service1Title} className="service-image" />
                )}
                <h3>{settings.service1Title}</h3>
                <p>{settings.service1Description}</p>
                <ul className="service-features">
                  {settings.service1Feature1 && <li>{settings.service1Feature1}</li>}
                  {settings.service1Feature2 && <li>{settings.service1Feature2}</li>}
                  {settings.service1Feature3 && <li>{settings.service1Feature3}</li>}
                  {settings.service1Feature4 && <li>{settings.service1Feature4}</li>}
                </ul>
              </div>
            )}

            {/* Service 2 */}
            {settings.service2Title && (
              <div className="service-card">
                {settings.service2ImageUrl && (
                  <img src={settings.service2ImageUrl} alt={settings.service2Title} className="service-image" />
                )}
                <h3>{settings.service2Title}</h3>
                <p>{settings.service2Description}</p>
                <ul className="service-features">
                  {settings.service2Feature1 && <li>{settings.service2Feature1}</li>}
                  {settings.service2Feature2 && <li>{settings.service2Feature2}</li>}
                  {settings.service2Feature3 && <li>{settings.service2Feature3}</li>}
                  {settings.service2Feature4 && <li>{settings.service2Feature4}</li>}
                </ul>
              </div>
            )}

            {/* Service 3 */}
            {settings.service3Title && (
              <div className="service-card">
                {settings.service3ImageUrl && (
                  <img src={settings.service3ImageUrl} alt={settings.service3Title} className="service-image" />
                )}
                <h3>{settings.service3Title}</h3>
                <p>{settings.service3Description}</p>
                <ul className="service-features">
                  {settings.service3Feature1 && <li>{settings.service3Feature1}</li>}
                  {settings.service3Feature2 && <li>{settings.service3Feature2}</li>}
                  {settings.service3Feature3 && <li>{settings.service3Feature3}</li>}
                  {settings.service3Feature4 && <li>{settings.service3Feature4}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="why-grid">
            {settings.whyFeature1Title && (
              <div className="why-card">
                <h3>{settings.whyFeature1Title}</h3>
                <p>{settings.whyFeature1Description}</p>
              </div>
            )}
            {settings.whyFeature2Title && (
              <div className="why-card">
                <h3>{settings.whyFeature2Title}</h3>
                <p>{settings.whyFeature2Description}</p>
              </div>
            )}
            {settings.whyFeature3Title && (
              <div className="why-card">
                <h3>{settings.whyFeature3Title}</h3>
                <p>{settings.whyFeature3Description}</p>
              </div>
            )}
            {settings.whyFeature4Title && (
              <div className="why-card">
                <h3>{settings.whyFeature4Title}</h3>
                <p>{settings.whyFeature4Description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              {settings.address && (
                <div className="info-item">
                  <strong>Address:</strong>
                  <p>
                    {settings.address}<br />
                    {settings.city}, {settings.state} {settings.zipCode}
                  </p>
                </div>
              )}
              {settings.phone && (
                <div className="info-item">
                  <strong>Phone:</strong>
                  <p><a href={`tel:${settings.phone}`}>{settings.phone}</a></p>
                </div>
              )}
              {settings.email && (
                <div className="info-item">
                  <strong>Email:</strong>
                  <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
                </div>
              )}

              {settings.businessHours.length > 0 && (
                <div className="info-item">
                  <strong>Hours:</strong>
                  <ul className="hours-list">
                    {settings.businessHours.map((day) => (
                      <li key={day.day}>
                        <span className="day-name">{day.day}:</span>
                        {day.isOpen ? (
                          <span className="day-hours">{day.openTime} - {day.closeTime}</span>
                        ) : (
                          <span className="day-closed">Closed</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="contact-form-container">
              <h3>Send Us a Message</h3>
              {formSubmitted ? (
                <div className="form-success">
                  Thank you for your message! We'll get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="contact-form">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone *"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Your Message *"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    required
                  />
                  {formError && <div className="form-error">{formError}</div>}
                  <button type="submit" className="submit-button">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <h2>{settings.ctaTitle || 'Ready to Get Started?'}</h2>
          <p>{settings.ctaSubtitle || 'Schedule your service appointment today'}</p>
          <a href="#contact" className="cta-button large">
            {settings.ctaButtonText || 'Book Appointment'}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPage;
