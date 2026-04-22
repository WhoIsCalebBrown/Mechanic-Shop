import { useState } from 'react';
import type { TenantSettings, DaySchedule, HolidayOverride } from '../../types/settings';

interface AvailabilityTabProps {
  settings: TenantSettings;
  onChange: (settings: TenantSettings) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityTab({ settings, onChange }: AvailabilityTabProps) {
  const [newHoliday, setNewHoliday] = useState<Partial<HolidayOverride>>({
    date: '',
    name: '',
    isClosed: true,
  });

  const handleDayToggle = (dayOfWeek: number) => {
    const updatedSchedule = settings.availability.weeklySchedule.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, isOpen: !day.isOpen } : day
    );

    onChange({
      ...settings,
      availability: {
        ...settings.availability,
        weeklySchedule: updatedSchedule,
      },
    });
  };

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    const updatedSchedule = settings.availability.weeklySchedule.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
    );

    onChange({
      ...settings,
      availability: {
        ...settings.availability,
        weeklySchedule: updatedSchedule,
      },
    });
  };

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) {
      return;
    }

    const holiday: HolidayOverride = {
      id: Date.now(), // Temporary ID for frontend
      date: newHoliday.date,
      name: newHoliday.name,
      isClosed: newHoliday.isClosed ?? true,
      openTime: newHoliday.openTime,
      closeTime: newHoliday.closeTime,
    };

    onChange({
      ...settings,
      availability: {
        ...settings.availability,
        holidayOverrides: [...settings.availability.holidayOverrides, holiday],
      },
    });

    // Reset form
    setNewHoliday({
      date: '',
      name: '',
      isClosed: true,
    });
  };

  const handleRemoveHoliday = (id: number) => {
    onChange({
      ...settings,
      availability: {
        ...settings.availability,
        holidayOverrides: settings.availability.holidayOverrides.filter((h) => h.id !== id),
      },
    });
  };

  const getDaySchedule = (dayOfWeek: number): DaySchedule => {
    return (
      settings.availability.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek) || {
        dayOfWeek,
        isOpen: false,
        openTime: '09:00',
        closeTime: '17:00',
      }
    );
  };

  return (
    <div className="settings-tab">
      <h2>Hours & Availability</h2>
      <p className="tab-description">Set your regular business hours and holiday schedules</p>

      <div className="availability-section">
        <h3>Weekly Schedule</h3>
        <div className="schedule-grid">
          {DAYS_OF_WEEK.map((dayName, index) => {
            const daySchedule = getDaySchedule(index);
            return (
              <div key={index} className="schedule-row">
                <div className="schedule-day">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={daySchedule.isOpen}
                      onChange={() => handleDayToggle(index)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span className="day-name">{dayName}</span>
                </div>

                {daySchedule.isOpen ? (
                  <div className="schedule-times">
                    <input
                      type="time"
                      value={daySchedule.openTime}
                      onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                      className="time-input"
                    />
                    <span className="time-separator">to</span>
                    <input
                      type="time"
                      value={daySchedule.closeTime}
                      onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                      className="time-input"
                    />
                  </div>
                ) : (
                  <div className="schedule-closed">
                    <span className="closed-label">Closed</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="availability-section">
        <h3>Holiday Overrides</h3>
        <p className="section-description">
          Add special dates when your hours differ from the regular schedule
        </p>

        {settings.availability.holidayOverrides.length > 0 && (
          <div className="holidays-list">
            {settings.availability.holidayOverrides
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((holiday) => (
                <div key={holiday.id} className="holiday-item">
                  <div className="holiday-info">
                    <span className="holiday-date">
                      {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="holiday-name">{holiday.name}</span>
                    {holiday.isClosed ? (
                      <span className="holiday-status closed">Closed</span>
                    ) : (
                      <span className="holiday-status open">
                        {holiday.openTime} - {holiday.closeTime}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-remove-holiday"
                    onClick={() => handleRemoveHoliday(holiday.id!)}
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="add-holiday-form">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="holiday-date">Date</label>
              <input
                id="holiday-date"
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-field">
              <label htmlFor="holiday-name">Name</label>
              <input
                id="holiday-name"
                type="text"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="e.g., Christmas Day"
              />
            </div>

            <div className="form-field">
              <label htmlFor="holiday-status">Status</label>
              <select
                id="holiday-status"
                value={newHoliday.isClosed ? 'closed' : 'open'}
                onChange={(e) =>
                  setNewHoliday({ ...newHoliday, isClosed: e.target.value === 'closed' })
                }
              >
                <option value="closed">Closed</option>
                <option value="open">Open with custom hours</option>
              </select>
            </div>
          </div>

          {!newHoliday.isClosed && (
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="holiday-open">Open Time</label>
                <input
                  id="holiday-open"
                  type="time"
                  value={newHoliday.openTime || '09:00'}
                  onChange={(e) => setNewHoliday({ ...newHoliday, openTime: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="holiday-close">Close Time</label>
                <input
                  id="holiday-close"
                  type="time"
                  value={newHoliday.closeTime || '17:00'}
                  onChange={(e) => setNewHoliday({ ...newHoliday, closeTime: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn-add-holiday"
            onClick={handleAddHoliday}
            disabled={!newHoliday.date || !newHoliday.name}
          >
            Add Holiday
          </button>
        </div>
      </div>
    </div>
  );
}
