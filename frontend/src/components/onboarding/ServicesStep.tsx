import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import type { ServiceTemplate } from '../../types';
import './OnboardingSteps.css';

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  { id: '1', name: 'Oil Change', description: 'Standard oil and filter change', estimatedDuration: 30, basePrice: 49.99, category: 'Maintenance' },
  { id: '2', name: 'Tire Rotation', description: 'Rotate and balance tires', estimatedDuration: 45, basePrice: 39.99, category: 'Maintenance' },
  { id: '3', name: 'Brake Inspection', description: 'Full brake system check', estimatedDuration: 60, basePrice: 0, category: 'Inspection' },
  { id: '4', name: 'Engine Diagnostic', description: 'Computer diagnostic scan', estimatedDuration: 60, basePrice: 89.99, category: 'Diagnostic' },
  { id: '5', name: 'Battery Replacement', description: 'Test and replace battery', estimatedDuration: 30, basePrice: 129.99, category: 'Electrical' },
  { id: '6', name: 'Air Filter Replacement', description: 'Replace cabin and engine air filters', estimatedDuration: 20, basePrice: 34.99, category: 'Maintenance' },
  { id: '7', name: 'Brake Pad Replacement', description: 'Replace front or rear brake pads', estimatedDuration: 120, basePrice: 199.99, category: 'Brakes' },
  { id: '8', name: 'Transmission Service', description: 'Transmission fluid flush and filter', estimatedDuration: 90, basePrice: 149.99, category: 'Transmission' },
];

export default function ServicesStep() {
  const { onboardingData, updateSelectedServices } = useOnboarding();
  const { selectedServices } = onboardingData;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(SERVICE_TEMPLATES.map((s) => s.category)))];

  const filteredServices =
    selectedCategory === 'All'
      ? SERVICE_TEMPLATES
      : SERVICE_TEMPLATES.filter((s) => s.category === selectedCategory);

  const handleToggleService = (service: ServiceTemplate) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    if (isSelected) {
      updateSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      updateSelectedServices([...selectedServices, service]);
    }
  };

  const handleSelectAll = () => {
    updateSelectedServices([...SERVICE_TEMPLATES]);
  };

  const handleClearAll = () => {
    updateSelectedServices([]);
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Initial Services</h2>
        <p>Select services you offer (you can add more later)</p>
      </div>

      <div className="step-content">
        <div className="services-controls">
          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="bulk-actions">
            <button type="button" onClick={handleSelectAll} className="bulk-btn">
              Select All
            </button>
            <button type="button" onClick={handleClearAll} className="bulk-btn">
              Clear All
            </button>
          </div>
        </div>

        <div className="services-grid">
          {filteredServices.map((service) => {
            const isSelected = selectedServices.some((s) => s.id === service.id);
            return (
              <div
                key={service.id}
                className={`service-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleService(service)}
              >
                <div className="service-check">
                  {isSelected && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    <span className="duration">{service.estimatedDuration} min</span>
                    {service.basePrice && service.basePrice > 0 ? (
                      <span className="price">${service.basePrice.toFixed(2)}</span>
                    ) : (
                      <span className="price">Free</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedServices.length === 0 && (
          <div className="info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p>
              No services selected yet. You can skip this step and add services later from your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
