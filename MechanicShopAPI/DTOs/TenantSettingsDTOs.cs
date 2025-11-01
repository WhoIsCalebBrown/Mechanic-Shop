namespace MechanicShopAPI.DTOs;

/// <summary>
/// Response DTO for tenant settings
/// </summary>
public class TenantSettingsDto
{
    public int Id { get; set; }

    // Business Profile
    public string Name { get; set; } = string.Empty;
    public string? BusinessAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string TimeZone { get; set; } = "America/New_York";

    // Branding
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }

    // Notifications (will be expanded)
    public NotificationSettingsDto Notifications { get; set; } = new();

    // Availability Rules (JSON structure)
    public AvailabilityRulesDto? AvailabilityRules { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request DTO for updating tenant settings
/// </summary>
public class UpdateTenantSettingsDto
{
    // Business Profile
    public string? Name { get; set; }
    public string? BusinessAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string? TimeZone { get; set; }

    // Branding
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }

    // Notifications
    public NotificationSettingsDto? Notifications { get; set; }

    // Availability Rules
    public AvailabilityRulesDto? AvailabilityRules { get; set; }
}

/// <summary>
/// Notification preferences for different event types
/// </summary>
public class NotificationSettingsDto
{
    // Email Notifications
    public bool EmailOnNewBooking { get; set; } = true;
    public bool EmailOnCancellation { get; set; } = true;
    public bool EmailOnPaymentReceived { get; set; } = true;
    public bool EmailOnServiceComplete { get; set; } = true;

    // SMS Notifications
    public bool SmsOnNewBooking { get; set; } = false;
    public bool SmsOnCancellation { get; set; } = false;
    public bool SmsOnPaymentReceived { get; set; } = false;
    public bool SmsOnServiceComplete { get; set; } = false;
}

/// <summary>
/// Weekly availability schedule with override dates
/// </summary>
public class AvailabilityRulesDto
{
    public WeeklyScheduleDto WeeklySchedule { get; set; } = new();
    public List<DateOverrideDto> DateOverrides { get; set; } = new();
}

/// <summary>
/// Weekly schedule (Monday-Sunday)
/// </summary>
public class WeeklyScheduleDto
{
    public DayScheduleDto Monday { get; set; } = new() { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" };
    public DayScheduleDto Tuesday { get; set; } = new() { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" };
    public DayScheduleDto Wednesday { get; set; } = new() { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" };
    public DayScheduleDto Thursday { get; set; } = new() { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" };
    public DayScheduleDto Friday { get; set; } = new() { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" };
    public DayScheduleDto Saturday { get; set; } = new() { IsOpen = false };
    public DayScheduleDto Sunday { get; set; } = new() { IsOpen = false };
}

/// <summary>
/// Schedule for a single day
/// </summary>
public class DayScheduleDto
{
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; }  // HH:mm format
    public string? CloseTime { get; set; }  // HH:mm format
}

/// <summary>
/// Override for specific dates (holidays, special closures)
/// </summary>
public class DateOverrideDto
{
    public DateTime Date { get; set; }
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
    public string? Reason { get; set; }  // e.g., "Christmas", "Independence Day"
}
