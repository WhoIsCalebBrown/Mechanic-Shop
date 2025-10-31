using MechanicShopAPI.Models;

namespace MechanicShopAPI.DTOs;

/// <summary>
/// Enhanced public booking page with SEO metadata
/// </summary>
public class PublicBookingPageDto
{
    public TenantProfileDto Profile { get; set; } = new();
    public List<PublicServiceDto> Services { get; set; } = new();
    public AvailabilityInfoDto Availability { get; set; } = new();
    public SeoMetadataDto Seo { get; set; } = new();
}

/// <summary>
/// Tenant profile information
/// </summary>
public class TenantProfileDto
{
    public string BusinessName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Description { get; set; }
    public LocationDto Location { get; set; } = new();
    public ContactDto Contact { get; set; } = new();
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
}

/// <summary>
/// Location information
/// </summary>
public class LocationDto
{
    public string? FullAddress { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Area { get; set; } // Neighborhood or service area
}

/// <summary>
/// Contact information
/// </summary>
public class ContactDto
{
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? FormattedPhone { get; set; } // e.g., "(312) 555-0100"
}

/// <summary>
/// Public service information
/// </summary>
public class PublicServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string FormattedPrice { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string FormattedDuration { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

/// <summary>
/// Availability information and hours
/// </summary>
public class AvailabilityInfoDto
{
    public string Timezone { get; set; } = "America/Chicago";
    public Dictionary<string, BusinessHoursDto> WeeklyHours { get; set; } = new();
    public List<string> ClosedDates { get; set; } = new();
    public Dictionary<string, BusinessHoursDto> SpecialHours { get; set; } = new();
    public BookingRulesDto BookingRules { get; set; } = new();
}

/// <summary>
/// Business hours for a day
/// </summary>
public class BusinessHoursDto
{
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
    public string? FormattedHours { get; set; } // e.g., "9:00 AM - 6:00 PM"
}

/// <summary>
/// Booking rules
/// </summary>
public class BookingRulesDto
{
    public int SlotDurationMinutes { get; set; }
    public int MaxAdvanceBookingDays { get; set; }
    public int MinAdvanceBookingHours { get; set; }
}

/// <summary>
/// SEO metadata for the booking page
/// </summary>
public class SeoMetadataDto
{
    // Standard meta tags
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
    public string CanonicalUrl { get; set; } = string.Empty;

    // Open Graph tags
    public OpenGraphDto OpenGraph { get; set; } = new();

    // Twitter Card tags
    public TwitterCardDto Twitter { get; set; } = new();

    // Structured data (JSON-LD)
    public string StructuredData { get; set; } = string.Empty;
}

/// <summary>
/// Open Graph metadata
/// </summary>
public class OpenGraphDto
{
    public string Type { get; set; } = "website";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Image { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public string Locale { get; set; } = "en_US";
}

/// <summary>
/// Twitter Card metadata
/// </summary>
public class TwitterCardDto
{
    public string Card { get; set; } = "summary_large_image";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Image { get; set; }
}

/// <summary>
/// Calendar month view with availability
/// </summary>
public class CalendarMonthDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public List<CalendarDayDto> Days { get; set; } = new();
}

/// <summary>
/// Single day in calendar
/// </summary>
public class CalendarDayDto
{
    public DateTime Date { get; set; }
    public int DayOfMonth { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public bool IsToday { get; set; }
    public bool IsPast { get; set; }
    public bool HasAvailability { get; set; }
    public int AvailableSlots { get; set; }
    public string? Reason { get; set; } // e.g., "Closed", "Holiday"
}
