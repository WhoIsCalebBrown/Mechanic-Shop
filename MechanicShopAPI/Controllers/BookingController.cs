using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.DTOs;
using MechanicShopAPI.Models;

namespace MechanicShopAPI.Controllers;

[ApiController]
[Route("api/book")]
public class BookingController : ControllerBase
{
    private readonly MechanicShopContext _context;
    private readonly ILogger<BookingController> _logger;

    public BookingController(MechanicShopContext context, ILogger<BookingController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get public booking page information for a tenant by slug
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<PublicBookingPageResponse>> GetBookingPage(string slug)
    {
        var tenant = await _context.Tenants
            .Include(t => t.ServiceItems.Where(s => s.IsActive && s.IsBookableOnline))
            .FirstOrDefaultAsync(t => t.Slug.ToLower() == slug.ToLower());

        if (tenant == null)
        {
            return NotFound(new { error = "Booking page not found" });
        }

        if (!tenant.BookingEnabled || !tenant.OnboardingCompleted)
        {
            return BadRequest(new { error = "Booking is not enabled for this business" });
        }

        AvailabilityRules? availabilityRules = null;
        if (!string.IsNullOrEmpty(tenant.AvailabilityRules))
        {
            availabilityRules = JsonSerializer.Deserialize<AvailabilityRules>(tenant.AvailabilityRules);
        }

        return Ok(new PublicBookingPageResponse
        {
            BusinessName = tenant.Name,
            Slug = tenant.Slug,
            Description = tenant.Description,
            Address = $"{tenant.BusinessAddress}, {tenant.City}, {tenant.State} {tenant.ZipCode}",
            Phone = tenant.Phone,
            Email = tenant.Email,
            Website = tenant.Website,
            LogoUrl = tenant.LogoUrl,
            Services = tenant.ServiceItems.Select(s => new ServiceItemDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                BasePrice = s.BasePrice,
                DurationMinutes = s.DurationMinutes,
                Category = s.Category.ToString()
            }).ToList(),
            AvailabilityRules = availabilityRules,
            Timezone = availabilityRules?.Timezone ?? "America/Chicago"
        });
    }

    /// <summary>
    /// Get available time slots for a specific date and service
    /// </summary>
    [HttpGet("{slug}/availability")]
    public async Task<ActionResult<AvailableTimeSlotsResponse>> GetAvailableTimeSlots(
        string slug,
        [FromQuery] DateTime date,
        [FromQuery] int serviceId)
    {
        var tenant = await _context.Tenants
            .Include(t => t.ServiceItems)
            .Include(t => t.Appointments)
            .FirstOrDefaultAsync(t => t.Slug.ToLower() == slug.ToLower());

        if (tenant == null || !tenant.BookingEnabled)
        {
            return NotFound(new { error = "Booking page not found" });
        }

        var service = tenant.ServiceItems.FirstOrDefault(s => s.Id == serviceId);
        if (service == null || !service.IsActive || !service.IsBookableOnline)
        {
            return BadRequest(new { error = "Service not found or not available for booking" });
        }

        if (string.IsNullOrEmpty(tenant.AvailabilityRules))
        {
            return BadRequest(new { error = "Availability rules not configured" });
        }

        var rules = JsonSerializer.Deserialize<AvailabilityRules>(tenant.AvailabilityRules);
        if (rules == null)
        {
            return BadRequest(new { error = "Invalid availability rules" });
        }

        var slots = GenerateTimeSlots(date, service, rules, tenant.Appointments.ToList());

        return Ok(new AvailableTimeSlotsResponse
        {
            Date = date,
            ServiceName = service.Name,
            DurationMinutes = service.DurationMinutes,
            AvailableSlots = slots
        });
    }

    // Helper method to generate available time slots
    private List<TimeSlotDto> GenerateTimeSlots(
        DateTime date,
        ServiceItem service,
        AvailabilityRules rules,
        List<Appointment> existingAppointments)
    {
        var slots = new List<TimeSlotDto>();
        var dayOfWeek = date.DayOfWeek;

        // Check if day is open
        if (!rules.WeeklySchedule.TryGetValue(dayOfWeek, out var schedule) ||
            schedule == null || !schedule.IsOpen)
        {
            return slots;
        }

        // Check if it's a closed date
        var dateStr = date.ToString("yyyy-MM-dd");
        if (rules.ClosedDates.Contains(dateStr))
        {
            return slots;
        }

        // Get hours for this day
        var openTime = TimeSpan.Parse(schedule.OpenTime ?? "08:00");
        var closeTime = TimeSpan.Parse(schedule.CloseTime ?? "17:00");

        // Check for special date override
        if (rules.SpecialDates.TryGetValue(dateStr, out var specialSchedule) && specialSchedule.IsOpen)
        {
            openTime = TimeSpan.Parse(specialSchedule.OpenTime ?? "08:00");
            closeTime = TimeSpan.Parse(specialSchedule.CloseTime ?? "17:00");
        }

        // Generate slots
        var currentSlot = openTime;
        var slotDuration = TimeSpan.FromMinutes(rules.SlotDurationMinutes);
        var serviceDuration = TimeSpan.FromMinutes(service.DurationMinutes);
        var buffer = TimeSpan.FromMinutes(rules.BufferMinutes);

        while (currentSlot + serviceDuration <= closeTime)
        {
            var slotDateTime = date.Date + currentSlot;

            // Check if slot is in the past
            if (slotDateTime < DateTime.Now.AddHours(rules.MinAdvanceBookingHours))
            {
                currentSlot += slotDuration;
                continue;
            }

            // Check if slot is too far in advance
            if (slotDateTime > DateTime.Now.AddDays(rules.MaxAdvanceBookingDays))
            {
                break;
            }

            // Check if slot conflicts with existing appointments
            var hasConflict = existingAppointments.Any(a =>
            {
                var appointmentEnd = a.ScheduledDate.AddMinutes(60); // Default 60 min if no duration
                var slotEnd = slotDateTime.Add(serviceDuration);
                return a.ScheduledDate < slotEnd && appointmentEnd > slotDateTime;
            });

            // Check breaks
            var isInBreak = schedule.Breaks?.Any(b =>
            {
                var breakStart = date.Date + TimeSpan.Parse(b.StartTime);
                var breakEnd = date.Date + TimeSpan.Parse(b.EndTime);
                var slotEnd = slotDateTime.Add(serviceDuration);
                return slotDateTime < breakEnd && slotEnd > breakStart;
            }) ?? false;

            if (!hasConflict && !isInBreak)
            {
                slots.Add(new TimeSlotDto
                {
                    StartTime = slotDateTime,
                    EndTime = slotDateTime.Add(serviceDuration),
                    IsAvailable = true
                });
            }

            currentSlot += slotDuration + buffer;
        }

        return slots;
    }
}

// DTOs for booking endpoints

public class PublicBookingPageResponse
{
    public string BusinessName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public List<ServiceItemDto> Services { get; set; } = new();
    public AvailabilityRules? AvailabilityRules { get; set; }
    public string Timezone { get; set; } = "America/Chicago";
}

public class ServiceItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public int DurationMinutes { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class AvailableTimeSlotsResponse
{
    public DateTime Date { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public List<TimeSlotDto> AvailableSlots { get; set; } = new();
}

public class TimeSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAvailable { get; set; }
}
