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
    public string? Tagline { get; set; }

    // Notifications (will be expanded)
    public NotificationSettingsDto Notifications { get; set; } = new();

    // Availability Rules (JSON structure)
    public AvailabilityRulesDto? AvailabilityRules { get; set; }

    // Public Profile - Stats
    public int VehiclesServiced { get; set; }
    public int SatisfactionRate { get; set; }
    public int YearsExperience { get; set; }

    // Public Profile - Hero Section
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? PrimaryCtaText { get; set; }
    public string? SecondaryCtaText { get; set; }
    public string? HeroImageUrl { get; set; }

    // Public Profile - Services
    public string? Service1Title { get; set; }
    public string? Service1Description { get; set; }
    public string? Service1Feature1 { get; set; }
    public string? Service1Feature2 { get; set; }
    public string? Service1Feature3 { get; set; }
    public string? Service1Feature4 { get; set; }
    public string? Service1ImageUrl { get; set; }

    public string? Service2Title { get; set; }
    public string? Service2Description { get; set; }
    public string? Service2Feature1 { get; set; }
    public string? Service2Feature2 { get; set; }
    public string? Service2Feature3 { get; set; }
    public string? Service2Feature4 { get; set; }
    public string? Service2ImageUrl { get; set; }

    public string? Service3Title { get; set; }
    public string? Service3Description { get; set; }
    public string? Service3Feature1 { get; set; }
    public string? Service3Feature2 { get; set; }
    public string? Service3Feature3 { get; set; }
    public string? Service3Feature4 { get; set; }
    public string? Service3ImageUrl { get; set; }

    // Public Profile - Why Choose Us
    public string? WhyFeature1Title { get; set; }
    public string? WhyFeature1Description { get; set; }
    public string? WhyFeature2Title { get; set; }
    public string? WhyFeature2Description { get; set; }
    public string? WhyFeature3Title { get; set; }
    public string? WhyFeature3Description { get; set; }
    public string? WhyFeature4Title { get; set; }
    public string? WhyFeature4Description { get; set; }

    // Public Profile - CTA Section
    public string? CtaTitle { get; set; }
    public string? CtaSubtitle { get; set; }
    public string? CtaButtonText { get; set; }

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
    public string? Tagline { get; set; }

    // Notifications
    public NotificationSettingsDto? Notifications { get; set; }

    // Availability Rules
    public AvailabilityRulesDto? AvailabilityRules { get; set; }

    // Public Profile - Stats
    public int? VehiclesServiced { get; set; }
    public int? SatisfactionRate { get; set; }
    public int? YearsExperience { get; set; }

    // Public Profile - Hero Section
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? PrimaryCtaText { get; set; }
    public string? SecondaryCtaText { get; set; }
    public string? HeroImageUrl { get; set; }

    // Public Profile - Services
    public string? Service1Title { get; set; }
    public string? Service1Description { get; set; }
    public string? Service1Feature1 { get; set; }
    public string? Service1Feature2 { get; set; }
    public string? Service1Feature3 { get; set; }
    public string? Service1Feature4 { get; set; }
    public string? Service1ImageUrl { get; set; }

    public string? Service2Title { get; set; }
    public string? Service2Description { get; set; }
    public string? Service2Feature1 { get; set; }
    public string? Service2Feature2 { get; set; }
    public string? Service2Feature3 { get; set; }
    public string? Service2Feature4 { get; set; }
    public string? Service2ImageUrl { get; set; }

    public string? Service3Title { get; set; }
    public string? Service3Description { get; set; }
    public string? Service3Feature1 { get; set; }
    public string? Service3Feature2 { get; set; }
    public string? Service3Feature3 { get; set; }
    public string? Service3Feature4 { get; set; }
    public string? Service3ImageUrl { get; set; }

    // Public Profile - Why Choose Us
    public string? WhyFeature1Title { get; set; }
    public string? WhyFeature1Description { get; set; }
    public string? WhyFeature2Title { get; set; }
    public string? WhyFeature2Description { get; set; }
    public string? WhyFeature3Title { get; set; }
    public string? WhyFeature3Description { get; set; }
    public string? WhyFeature4Title { get; set; }
    public string? WhyFeature4Description { get; set; }

    // Public Profile - CTA Section
    public string? CtaTitle { get; set; }
    public string? CtaSubtitle { get; set; }
    public string? CtaButtonText { get; set; }
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

public class NotificationPreferencesDto
{
    public bool NewBookingEmail { get; set; } = true;
    public bool NewBookingSms { get; set; } = false;
    public bool PaymentReceivedEmail { get; set; } = true;
    public bool PaymentReceivedSms { get; set; } = false;
    public bool AppointmentReminderEmail { get; set; } = true;
    public bool AppointmentReminderSms { get; set; } = false;
    public bool CancellationEmail { get; set; } = true;
    public bool CancellationSms { get; set; } = false;
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
    public int DayOfWeek { get; set; }
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

public class AvailabilitySettingsDto
{
    public List<DayScheduleDto> WeeklySchedule { get; set; } = new();
    public List<HolidayOverrideDto> HolidayOverrides { get; set; } = new();
}

public class HolidayOverrideDto
{
    public int? Id { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsClosed { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
}

public class TenantSettingsResponse
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Timezone { get; set; } = "America/New_York";
    public BrandingSettingsDto Branding { get; set; } = new();
    public NotificationPreferencesDto Notifications { get; set; } = new();
    public AvailabilitySettingsDto Availability { get; set; } = new();
}

public class UpdateTenantSettingsRequest
{
    public string? BusinessName { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Timezone { get; set; }
    public BrandingSettingsDto? Branding { get; set; }
    public NotificationPreferencesDto? Notifications { get; set; }
    public AvailabilitySettingsDto? Availability { get; set; }
}

public class BrandingSettingsDto
{
    public string? LogoUrl { get; set; }
    public string PrimaryColor { get; set; } = "#2563eb";
    public string? SecondaryColor { get; set; }
}

public class LogoUploadResponse
{
    public string LogoUrl { get; set; } = string.Empty;
}
