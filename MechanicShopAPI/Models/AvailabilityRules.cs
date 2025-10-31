using System.Text.Json.Serialization;

namespace MechanicShopAPI.Models;

/// <summary>
/// Availability rules for tenant - stored as JSON in database
/// </summary>
public class AvailabilityRules
{
    /// <summary>
    /// Timezone for the business (e.g., "America/Chicago")
    /// </summary>
    public string Timezone { get; set; } = "America/Chicago";

    /// <summary>
    /// Weekly schedule - defines when the business is open
    /// </summary>
    public Dictionary<DayOfWeek, DaySchedule?> WeeklySchedule { get; set; } = new()
    {
        { DayOfWeek.Monday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" } },
        { DayOfWeek.Tuesday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" } },
        { DayOfWeek.Wednesday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" } },
        { DayOfWeek.Thursday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" } },
        { DayOfWeek.Friday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" } },
        { DayOfWeek.Saturday, new DaySchedule { IsOpen = true, OpenTime = "09:00", CloseTime = "13:00" } },
        { DayOfWeek.Sunday, new DaySchedule { IsOpen = false } }
    };

    /// <summary>
    /// Slot duration in minutes (default 30 minutes)
    /// </summary>
    public int SlotDurationMinutes { get; set; } = 30;

    /// <summary>
    /// Buffer time between appointments in minutes
    /// </summary>
    public int BufferMinutes { get; set; } = 0;

    /// <summary>
    /// How many days in advance customers can book
    /// </summary>
    public int MaxAdvanceBookingDays { get; set; } = 30;

    /// <summary>
    /// Minimum hours in advance required for booking
    /// </summary>
    public int MinAdvanceBookingHours { get; set; } = 2;

    /// <summary>
    /// Special dates when business is closed (holidays, etc.)
    /// </summary>
    public List<string> ClosedDates { get; set; } = new(); // ISO dates: "2025-12-25"

    /// <summary>
    /// Special date overrides for custom hours
    /// </summary>
    public Dictionary<string, DaySchedule> SpecialDates { get; set; } = new();
}

public class DaySchedule
{
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; } // HH:mm format (e.g., "08:00")
    public string? CloseTime { get; set; } // HH:mm format (e.g., "17:00")
    public List<BreakPeriod>? Breaks { get; set; } // Optional lunch breaks, etc.
}

public class BreakPeriod
{
    public string StartTime { get; set; } = string.Empty; // HH:mm
    public string EndTime { get; set; } = string.Empty; // HH:mm
}
