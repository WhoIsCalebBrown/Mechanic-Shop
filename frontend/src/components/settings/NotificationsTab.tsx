import type { TenantSettings, NotificationPreferences } from '../../types/settings';

interface NotificationsTabProps {
  settings: TenantSettings;
  onChange: (settings: TenantSettings) => void;
}

interface NotificationToggle {
  id: keyof NotificationPreferences;
  label: string;
  description: string;
  emailKey: keyof NotificationPreferences;
  smsKey: keyof NotificationPreferences;
}

const NOTIFICATION_TYPES: NotificationToggle[] = [
  {
    id: 'newBookingEmail',
    label: 'New Booking',
    description: 'When a customer books a new appointment',
    emailKey: 'newBookingEmail',
    smsKey: 'newBookingSms',
  },
  {
    id: 'paymentReceivedEmail',
    label: 'Payment Received',
    description: 'When a payment is successfully processed',
    emailKey: 'paymentReceivedEmail',
    smsKey: 'paymentReceivedSms',
  },
  {
    id: 'appointmentReminderEmail',
    label: 'Appointment Reminder',
    description: 'Daily digest of upcoming appointments',
    emailKey: 'appointmentReminderEmail',
    smsKey: 'appointmentReminderSms',
  },
  {
    id: 'cancellationEmail',
    label: 'Cancellation',
    description: 'When a customer cancels an appointment',
    emailKey: 'cancellationEmail',
    smsKey: 'cancellationSms',
  },
];

export default function NotificationsTab({ settings, onChange }: NotificationsTabProps) {
  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    onChange({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const handleToggleAll = (channel: 'email' | 'sms', enabled: boolean) => {
    const updates: Partial<NotificationPreferences> = {};

    NOTIFICATION_TYPES.forEach((type) => {
      const key = channel === 'email' ? type.emailKey : type.smsKey;
      updates[key] = enabled;
    });

    onChange({
      ...settings,
      notifications: {
        ...settings.notifications,
        ...updates,
      },
    });
  };

  const areAllEnabled = (channel: 'email' | 'sms'): boolean => {
    return NOTIFICATION_TYPES.every((type) => {
      const key = channel === 'email' ? type.emailKey : type.smsKey;
      return settings.notifications[key];
    });
  };

  return (
    <div className="settings-tab">
      <h2>Notification Preferences</h2>
      <p className="tab-description">Choose how you want to be notified about important events</p>

      <div className="notifications-header">
        <div className="notification-label-column">
          <span className="header-label">Event Type</span>
        </div>
        <div className="notification-toggle-column">
          <div className="channel-header">
            <span className="channel-label">Email</span>
            <button
              type="button"
              className="toggle-all-button"
              onClick={() => handleToggleAll('email', !areAllEnabled('email'))}
            >
              {areAllEnabled('email') ? 'Disable All' : 'Enable All'}
            </button>
          </div>
        </div>
        <div className="notification-toggle-column">
          <div className="channel-header">
            <span className="channel-label">SMS</span>
            <button
              type="button"
              className="toggle-all-button"
              onClick={() => handleToggleAll('sms', !areAllEnabled('sms'))}
            >
              {areAllEnabled('sms') ? 'Disable All' : 'Enable All'}
            </button>
          </div>
        </div>
      </div>

      <div className="notifications-list">
        {NOTIFICATION_TYPES.map((notificationType) => (
          <div key={notificationType.id} className="notification-row">
            <div className="notification-info">
              <h4>{notificationType.label}</h4>
              <p>{notificationType.description}</p>
            </div>

            <div className="notification-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications[notificationType.emailKey]}
                  onChange={(e) => handleToggle(notificationType.emailKey, e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="notification-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications[notificationType.smsKey]}
                  onChange={(e) => handleToggle(notificationType.smsKey, e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="notifications-note">
        <p>
          <strong>Note:</strong> Email notifications will be sent to {settings.email}. SMS
          notifications will be sent to {settings.phone}.
        </p>
      </div>
    </div>
  );
}
