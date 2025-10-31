using System.Text.Json;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.DTOs;
using MechanicShopAPI.Models;
using QRCoder;

namespace MechanicShopAPI.Controllers;

[ApiController]
[Route("api/book")]
public class BookingController : ControllerBase
{
    private readonly MechanicShopContext _context;
    private readonly ILogger<BookingController> _logger;
    private readonly IConfiguration _configuration;

    public BookingController(
        MechanicShopContext context,
        ILogger<BookingController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
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
    /// Get enhanced public booking page with SEO metadata (v2)
    /// </summary>
    [HttpGet("{slug}/v2")]
    public async Task<ActionResult<PublicBookingPageDto>> GetBookingPageV2(string slug)
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

        var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";
        var pageUrl = $"{baseUrl}/book/{slug}";

        var availabilityRules = string.IsNullOrEmpty(tenant.AvailabilityRules)
            ? new AvailabilityRules()
            : JsonSerializer.Deserialize<AvailabilityRules>(tenant.AvailabilityRules) ?? new AvailabilityRules();

        var result = new PublicBookingPageDto
        {
            Profile = new TenantProfileDto
            {
                BusinessName = tenant.Name,
                Slug = tenant.Slug,
                Bio = tenant.Description,
                Description = tenant.Description,
                Location = new LocationDto
                {
                    FullAddress = $"{tenant.BusinessAddress}, {tenant.City}, {tenant.State} {tenant.ZipCode}",
                    Street = tenant.BusinessAddress,
                    City = tenant.City,
                    State = tenant.State,
                    ZipCode = tenant.ZipCode,
                    Country = tenant.Country,
                    Area = $"{tenant.City}, {tenant.State}"
                },
                Contact = new ContactDto
                {
                    Phone = tenant.Phone,
                    Email = tenant.Email,
                    FormattedPhone = FormatPhone(tenant.Phone)
                },
                LogoUrl = tenant.LogoUrl,
                Website = tenant.Website
            },
            Services = tenant.ServiceItems.Select(s => new PublicServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                BasePrice = s.BasePrice,
                FormattedPrice = FormatPrice(s.BasePrice),
                DurationMinutes = s.DurationMinutes,
                FormattedDuration = FormatDuration(s.DurationMinutes),
                Category = s.Category.ToString()
            }).ToList(),
            Availability = BuildAvailabilityInfo(availabilityRules),
            Seo = BuildSeoMetadata(tenant, pageUrl)
        };

        return Ok(result);
    }

    /// <summary>
    /// Get availability calendar for a month
    /// </summary>
    [HttpGet("{slug}/calendar/{year}/{month}")]
    public async Task<ActionResult<CalendarMonthDto>> GetCalendarMonth(
        string slug,
        int year,
        int month,
        [FromQuery] int? serviceId = null)
    {
        if (month < 1 || month > 12)
        {
            return BadRequest(new { error = "Month must be between 1 and 12" });
        }

        var tenant = await _context.Tenants
            .Include(t => t.ServiceItems)
            .Include(t => t.Appointments)
            .FirstOrDefaultAsync(t => t.Slug.ToLower() == slug.ToLower());

        if (tenant == null || !tenant.BookingEnabled)
        {
            return NotFound(new { error = "Booking page not found" });
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

        ServiceItem? service = null;
        if (serviceId.HasValue)
        {
            service = tenant.ServiceItems.FirstOrDefault(s => s.Id == serviceId.Value && s.IsActive && s.IsBookableOnline);
            if (service == null)
            {
                return BadRequest(new { error = "Service not found" });
            }
        }

        var calendar = BuildCalendarMonth(year, month, tenant, rules, service);
        return Ok(calendar);
    }

    /// <summary>
    /// Generate QR code for booking page
    /// </summary>
    [HttpGet("{slug}/qr")]
    public async Task<IActionResult> GetQRCode(string slug, [FromQuery] int? size = 300)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Slug.ToLower() == slug.ToLower());

        if (tenant == null || !tenant.BookingEnabled)
        {
            return NotFound(new { error = "Booking page not found" });
        }

        var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";
        var bookingUrl = $"{baseUrl}/book/{slug}";

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(bookingUrl, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);

        var qrCodeImage = qrCode.GetGraphic(20);

        return File(qrCodeImage, "image/png", $"{slug}-booking-qr.png");
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

    // Helper methods for formatting and building responses

    private string FormatPhone(string? phone)
    {
        if (string.IsNullOrEmpty(phone)) return string.Empty;

        // Simple US phone formatting
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.Length == 10)
        {
            return $"({digits[..3]}) {digits.Substring(3, 3)}-{digits.Substring(6, 4)}";
        }
        return phone;
    }

    private string FormatPrice(decimal price)
    {
        return price.ToString("C2", CultureInfo.GetCultureInfo("en-US"));
    }

    private string FormatDuration(int minutes)
    {
        if (minutes < 60)
        {
            return $"{minutes} min";
        }
        else if (minutes % 60 == 0)
        {
            return $"{minutes / 60} hr";
        }
        else
        {
            var hours = minutes / 60;
            var mins = minutes % 60;
            return $"{hours} hr {mins} min";
        }
    }

    private string FormatTime12Hour(string time24)
    {
        if (TimeSpan.TryParse(time24, out var timeSpan))
        {
            var dateTime = DateTime.Today.Add(timeSpan);
            return dateTime.ToString("h:mm tt", CultureInfo.InvariantCulture);
        }
        return time24;
    }

    private AvailabilityInfoDto BuildAvailabilityInfo(AvailabilityRules rules)
    {
        var weeklyHours = new Dictionary<string, BusinessHoursDto>();

        foreach (var (dayOfWeek, schedule) in rules.WeeklySchedule)
        {
            weeklyHours[dayOfWeek.ToString()] = new BusinessHoursDto
            {
                IsOpen = schedule?.IsOpen ?? false,
                OpenTime = schedule?.OpenTime,
                CloseTime = schedule?.CloseTime,
                FormattedHours = schedule?.IsOpen == true && schedule.OpenTime != null && schedule.CloseTime != null
                    ? $"{FormatTime12Hour(schedule.OpenTime)} - {FormatTime12Hour(schedule.CloseTime)}"
                    : "Closed"
            };
        }

        var specialHours = new Dictionary<string, BusinessHoursDto>();
        foreach (var (date, schedule) in rules.SpecialDates)
        {
            specialHours[date] = new BusinessHoursDto
            {
                IsOpen = schedule.IsOpen,
                OpenTime = schedule.OpenTime,
                CloseTime = schedule.CloseTime,
                FormattedHours = schedule.IsOpen && schedule.OpenTime != null && schedule.CloseTime != null
                    ? $"{FormatTime12Hour(schedule.OpenTime)} - {FormatTime12Hour(schedule.CloseTime)}"
                    : "Closed"
            };
        }

        return new AvailabilityInfoDto
        {
            Timezone = rules.Timezone,
            WeeklyHours = weeklyHours,
            ClosedDates = rules.ClosedDates,
            SpecialHours = specialHours,
            BookingRules = new BookingRulesDto
            {
                SlotDurationMinutes = rules.SlotDurationMinutes,
                MaxAdvanceBookingDays = rules.MaxAdvanceBookingDays,
                MinAdvanceBookingHours = rules.MinAdvanceBookingHours
            }
        };
    }

    private SeoMetadataDto BuildSeoMetadata(Tenant tenant, string pageUrl)
    {
        var title = $"{tenant.Name} - Book Online";
        var description = tenant.Description ?? $"Book auto repair services online at {tenant.Name} in {tenant.City}, {tenant.State}. Fast, reliable service.";
        var keywords = $"{tenant.Name}, auto repair, {tenant.City}, {tenant.State}, car service, book online";

        var structuredData = JsonSerializer.Serialize(new
        {
            context = "https://schema.org",
            type = "LocalBusiness",
            name = tenant.Name,
            description = tenant.Description,
            telephone = tenant.Phone,
            email = tenant.Email,
            address = new
            {
                type = "PostalAddress",
                streetAddress = tenant.BusinessAddress,
                addressLocality = tenant.City,
                addressRegion = tenant.State,
                postalCode = tenant.ZipCode,
                addressCountry = tenant.Country ?? "US"
            },
            url = pageUrl,
            image = tenant.LogoUrl,
            priceRange = "$$"
        }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return new SeoMetadataDto
        {
            Title = title,
            Description = description,
            Keywords = keywords,
            CanonicalUrl = pageUrl,
            OpenGraph = new OpenGraphDto
            {
                Type = "website",
                Title = title,
                Description = description,
                Url = pageUrl,
                Image = tenant.LogoUrl,
                SiteName = tenant.Name
            },
            Twitter = new TwitterCardDto
            {
                Card = "summary_large_image",
                Title = title,
                Description = description,
                Image = tenant.LogoUrl
            },
            StructuredData = structuredData
        };
    }

    private CalendarMonthDto BuildCalendarMonth(
        int year,
        int month,
        Tenant tenant,
        AvailabilityRules rules,
        ServiceItem? service)
    {
        var firstDay = new DateTime(year, month, 1);
        var lastDay = firstDay.AddMonths(1).AddDays(-1);
        var today = DateTime.Today;

        var days = new List<CalendarDayDto>();

        for (var date = firstDay; date <= lastDay; date = date.AddDays(1))
        {
            var dayOfWeek = date.DayOfWeek;
            var dateStr = date.ToString("yyyy-MM-dd");

            // Check if closed
            bool isOpen = true;
            string? reason = null;

            if (rules.ClosedDates.Contains(dateStr))
            {
                isOpen = false;
                reason = "Closed - Holiday";
            }
            else if (rules.SpecialDates.TryGetValue(dateStr, out var specialSchedule))
            {
                isOpen = specialSchedule.IsOpen;
                if (!isOpen) reason = "Closed - Special Date";
            }
            else if (rules.WeeklySchedule.TryGetValue(dayOfWeek, out var schedule) && schedule != null)
            {
                isOpen = schedule.IsOpen;
                if (!isOpen) reason = "Closed";
            }
            else
            {
                isOpen = false;
                reason = "Closed";
            }

            // Check availability
            int availableSlots = 0;
            if (isOpen && service != null && date >= today)
            {
                var slots = GenerateTimeSlots(date, service, rules, tenant.Appointments.ToList());
                availableSlots = slots.Count;
            }

            days.Add(new CalendarDayDto
            {
                Date = date,
                DayOfMonth = date.Day,
                DayOfWeek = date.DayOfWeek.ToString(),
                IsOpen = isOpen,
                IsToday = date == today,
                IsPast = date < today,
                HasAvailability = availableSlots > 0,
                AvailableSlots = availableSlots,
                Reason = reason
            });
        }

        return new CalendarMonthDto
        {
            Year = year,
            Month = month,
            MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
            Days = days
        };
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
