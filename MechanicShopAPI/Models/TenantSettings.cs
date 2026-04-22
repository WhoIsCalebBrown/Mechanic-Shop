namespace MechanicShopAPI.Models;

public class NotificationPreferences
{
    public int Id { get; set; }
    public int TenantId { get; set; }

    // Email notifications
    public bool NewBookingEmail { get; set; } = true;
    public bool PaymentReceivedEmail { get; set; } = true;
    public bool AppointmentReminderEmail { get; set; } = true;
    public bool CancellationEmail { get; set; } = true;

    // SMS notifications
    public bool NewBookingSms { get; set; } = false;
    public bool PaymentReceivedSms { get; set; } = false;
    public bool AppointmentReminderSms { get; set; } = false;
    public bool CancellationSms { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public Tenant Tenant { get; set; } = null!;
}

public class HolidayOverride
{
    public int Id { get; set; }
    public int TenantId { get; set; }

    public DateTime Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsClosed { get; set; } = true;
    public TimeSpan? OpenTime { get; set; }
    public TimeSpan? CloseTime { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Tenant Tenant { get; set; } = null!;
}

public class BrandingSettings
{
    public string? LogoUrl { get; set; }
    public string PrimaryColor { get; set; } = "#2563eb";
    public string? SecondaryColor { get; set; }
}
