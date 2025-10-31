import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import type { DaySchedule, DayOfWeek } from '../../types';
import './OnboardingSteps.css';

export default function OperatingHoursStep() {
  const { onboardingData, updateOperatingHours } = useOnboarding();
  const { operatingHours } = onboardingData;

  const handleToggleDay = (day: DayOfWeek) => {
    const updated = operatingHours.map((schedule) =>
      schedule.day === day ? { ...schedule, isOpen: !schedule.isOpen } : schedule
    );
    updateOperatingHours(updated);
  };

  const handleTimeChange = (day: DayOfWeek, field: 'open' | 'close', value: string) => {
    const updated = operatingHours.map((schedule) =>
      schedule.day === day
        ? { ...schedule, timeSlots: [{ ...schedule.timeSlots[0], [field]: value }] }
        : schedule
    );
    updateOperatingHours(updated);
  };

  const applyToAll = (sourceDay: DayOfWeek) => {
    const source = operatingHours.find((s) => s.day === sourceDay);
    if (!source) return;

    const updated = operatingHours.map((schedule) => ({
      ...schedule,
      timeSlots: source.timeSlots,
    }));
    updateOperatingHours(updated);
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Operating Hours</h2>
        <p>Set your weekly schedule</p>
      </div>

      <div className="step-content">
        <div className="hours-grid">
          {operatingHours.map((schedule) => (
            <div key={schedule.day} className={`day-row ${!schedule.isOpen ? 'closed' : ''}`}>
              <div className="day-toggle">
                <input
                  type="checkbox"
                  id={`toggle-${schedule.day}`}
                  checked={schedule.isOpen}
                  onChange={() => handleToggleDay(schedule.day)}
                />
                <label htmlFor={`toggle-${schedule.day}`} className="day-name">
                  {schedule.day}
                </label>
              </div>

              {schedule.isOpen ? (
                <div className="time-inputs">
                  <input
                    type="time"
                    value={schedule.timeSlots[0].open}
                    onChange={(e) => handleTimeChange(schedule.day, 'open', e.target.value)}
                    className="time-input"
                  />
                  <span className="time-separator">to</span>
                  <input
                    type="time"
                    value={schedule.timeSlots[0].close}
                    onChange={(e) => handleTimeChange(schedule.day, 'close', e.target.value)}
                    className="time-input"
                  />
                  <button
                    type="button"
                    onClick={() => applyToAll(schedule.day)}
                    className="apply-all-btn"
                    title="Apply to all days"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="closed-label">Closed</div>
              )}
            </div>
          ))}
        </div>

        <div className="info-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>
            Click the copy icon to apply hours from one day to all days. You can adjust individual days later.
          </p>
        </div>
      </div>
    </div>
  );
}
