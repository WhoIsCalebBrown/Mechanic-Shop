using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using MechanicShopAPI.Data;
using MechanicShopAPI.DTOs;
using MechanicShopAPI.Models;
using MechanicShopAPI.Services;

namespace MechanicShopAPI.Controllers;

[Authorize(Policy = "RequireStaff")]
[ApiController]
[Route("api/[controller]")]
public class TenantController : ControllerBase
{
    private readonly MechanicShopContext _context;
    private readonly ITenantAccessor _tenantAccessor;

    public TenantController(MechanicShopContext context, ITenantAccessor tenantAccessor)
    {
        _context = context;
        _tenantAccessor = tenantAccessor;
    }

    [HttpGet("settings")]
    public async Task<ActionResult<TenantSettingsResponse>> GetSettings()
    {
        var tenantId = _tenantAccessor.TenantId;
        if (tenantId == null)
        {
            return Unauthorized(new { error = "No tenant context found" });
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId.Value);

        if (tenant == null)
        {
            return NotFound(new { error = "Tenant not found" });
        }

        // Get notification preferences or create default
        var notifications = await _context.NotificationPreferences
            .FirstOrDefaultAsync(n => n.TenantId == tenantId.Value)
            ?? new NotificationPreferences { TenantId = tenantId.Value };

        // Get holiday overrides
        var holidays = await _context.HolidayOverrides
            .Where(h => h.TenantId == tenantId.Value)
            .OrderBy(h => h.Date)
            .ToListAsync();

        // Parse availability rules from JSON
        var availabilityRules = string.IsNullOrEmpty(tenant.AvailabilityRules)
            ? new AvailabilityRules()
            : JsonSerializer.Deserialize<AvailabilityRules>(tenant.AvailabilityRules) ?? new AvailabilityRules();

        // Parse branding settings from JSON
        var brandingSettings = string.IsNullOrEmpty(tenant.BrandingSettings)
            ? new BrandingSettings()
            : JsonSerializer.Deserialize<BrandingSettings>(tenant.BrandingSettings) ?? new BrandingSettings();

        // Override logo URL if set directly on tenant
        if (!string.IsNullOrEmpty(tenant.LogoUrl))
        {
            brandingSettings.LogoUrl = tenant.LogoUrl;
        }

        var response = new TenantSettingsResponse
        {
            Id = tenant.Id,
            Slug = tenant.Slug,
            BusinessName = tenant.Name,
            Address = tenant.BusinessAddress ?? string.Empty,
            City = tenant.City ?? string.Empty,
            State = tenant.State ?? string.Empty,
            ZipCode = tenant.ZipCode ?? string.Empty,
            Phone = tenant.Phone ?? string.Empty,
            Email = tenant.Email ?? string.Empty,
            Timezone = tenant.Timezone ?? "America/New_York",
            Branding = new BrandingSettingsDto
            {
                LogoUrl = brandingSettings.LogoUrl,
                PrimaryColor = brandingSettings.PrimaryColor,
                SecondaryColor = brandingSettings.SecondaryColor
            },
            Notifications = new NotificationPreferencesDto
            {
                NewBookingEmail = notifications.NewBookingEmail,
                NewBookingSms = notifications.NewBookingSms,
                PaymentReceivedEmail = notifications.PaymentReceivedEmail,
                PaymentReceivedSms = notifications.PaymentReceivedSms,
                AppointmentReminderEmail = notifications.AppointmentReminderEmail,
                AppointmentReminderSms = notifications.AppointmentReminderSms,
                CancellationEmail = notifications.CancellationEmail,
                CancellationSms = notifications.CancellationSms
            },
            Availability = new AvailabilitySettingsDto
            {
                WeeklySchedule = availabilityRules.WeeklySchedule?.Select(kvp => new DayScheduleDto
                {
                    DayOfWeek = (int)kvp.Key,
                    IsOpen = kvp.Value?.IsOpen ?? false,
                    OpenTime = kvp.Value?.OpenTime ?? "09:00",
                    CloseTime = kvp.Value?.CloseTime ?? "17:00"
                }).ToList() ?? new List<DayScheduleDto>(),
                HolidayOverrides = holidays.Select(h => new HolidayOverrideDto
                {
                    Id = h.Id,
                    Date = h.Date.ToString("yyyy-MM-dd"),
                    Name = h.Name,
                    IsClosed = h.IsClosed,
                    OpenTime = h.OpenTime?.ToString(@"hh\:mm"),
                    CloseTime = h.CloseTime?.ToString(@"hh\:mm")
                }).ToList()
            }
        };

        return Ok(response);
    }

    [HttpPut("settings")]
    [Authorize(Policy = "RequireManagement")]
    public async Task<ActionResult<TenantSettingsResponse>> UpdateSettings([FromBody] UpdateTenantSettingsRequest request)
    {
        var tenantId = _tenantAccessor.TenantId;
        if (tenantId == null)
        {
            return Unauthorized(new { error = "No tenant context found" });
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId.Value);

        if (tenant == null)
        {
            return NotFound(new { error = "Tenant not found" });
        }

        // Update business profile
        if (!string.IsNullOrEmpty(request.BusinessName))
            tenant.Name = request.BusinessName;
        if (request.Address != null)
            tenant.BusinessAddress = request.Address;
        if (request.City != null)
            tenant.City = request.City;
        if (request.State != null)
            tenant.State = request.State;
        if (request.ZipCode != null)
            tenant.ZipCode = request.ZipCode;
        if (request.Phone != null)
            tenant.Phone = request.Phone;
        if (request.Email != null)
            tenant.Email = request.Email;
        if (request.Timezone != null)
            tenant.Timezone = request.Timezone;

        // Update branding settings
        if (request.Branding != null)
        {
            var brandingSettings = new BrandingSettings
            {
                LogoUrl = request.Branding.LogoUrl,
                PrimaryColor = request.Branding.PrimaryColor,
                SecondaryColor = request.Branding.SecondaryColor
            };
            tenant.BrandingSettings = JsonSerializer.Serialize(brandingSettings);
            tenant.LogoUrl = request.Branding.LogoUrl;
        }

        // Update notification preferences
        if (request.Notifications != null)
        {
            var notifications = await _context.NotificationPreferences
                .FirstOrDefaultAsync(n => n.TenantId == tenantId.Value);

            if (notifications == null)
            {
                notifications = new NotificationPreferences
                {
                    TenantId = tenantId.Value,
                    NewBookingEmail = request.Notifications.NewBookingEmail,
                    NewBookingSms = request.Notifications.NewBookingSms,
                    PaymentReceivedEmail = request.Notifications.PaymentReceivedEmail,
                    PaymentReceivedSms = request.Notifications.PaymentReceivedSms,
                    AppointmentReminderEmail = request.Notifications.AppointmentReminderEmail,
                    AppointmentReminderSms = request.Notifications.AppointmentReminderSms,
                    CancellationEmail = request.Notifications.CancellationEmail,
                    CancellationSms = request.Notifications.CancellationSms
                };
                _context.NotificationPreferences.Add(notifications);
            }
            else
            {
                notifications.NewBookingEmail = request.Notifications.NewBookingEmail;
                notifications.NewBookingSms = request.Notifications.NewBookingSms;
                notifications.PaymentReceivedEmail = request.Notifications.PaymentReceivedEmail;
                notifications.PaymentReceivedSms = request.Notifications.PaymentReceivedSms;
                notifications.AppointmentReminderEmail = request.Notifications.AppointmentReminderEmail;
                notifications.AppointmentReminderSms = request.Notifications.AppointmentReminderSms;
                notifications.CancellationEmail = request.Notifications.CancellationEmail;
                notifications.CancellationSms = request.Notifications.CancellationSms;
                notifications.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Update availability settings
        if (request.Availability != null)
        {
            var availabilityRules = new AvailabilityRules
            {
                WeeklySchedule = request.Availability.WeeklySchedule?
                    .ToDictionary(
                        d => (DayOfWeek)d.DayOfWeek,
                        d => (DaySchedule?)new DaySchedule
                        {
                            IsOpen = d.IsOpen,
                            OpenTime = d.OpenTime,
                            CloseTime = d.CloseTime
                        }
                    ) ?? new Dictionary<DayOfWeek, DaySchedule?>()
            };
            tenant.AvailabilityRules = JsonSerializer.Serialize(availabilityRules);

            // Update holiday overrides
            // Remove existing holidays
            var existingHolidays = await _context.HolidayOverrides
                .Where(h => h.TenantId == tenantId.Value)
                .ToListAsync();
            _context.HolidayOverrides.RemoveRange(existingHolidays);

            // Add new holidays
            if (request.Availability.HolidayOverrides != null)
            {
                foreach (var holidayDto in request.Availability.HolidayOverrides)
                {
                    if (DateTime.TryParse(holidayDto.Date, out var date))
                    {
                        var holiday = new HolidayOverride
                        {
                            TenantId = tenantId.Value,
                            Date = date,
                            Name = holidayDto.Name,
                            IsClosed = holidayDto.IsClosed,
                            OpenTime = !string.IsNullOrEmpty(holidayDto.OpenTime) ? TimeSpan.Parse(holidayDto.OpenTime) : null,
                            CloseTime = !string.IsNullOrEmpty(holidayDto.CloseTime) ? TimeSpan.Parse(holidayDto.CloseTime) : null
                        };
                        _context.HolidayOverrides.Add(holiday);
                    }
                }
            }
        }

        tenant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Return updated settings
        return await GetSettings();
    }

    [HttpPost("logo")]
    [Authorize(Policy = "RequireManagement")]
    public async Task<ActionResult<LogoUploadResponse>> UploadLogo([FromForm] IFormFile logo)
    {
        var tenantId = _tenantAccessor.TenantId;
        if (tenantId == null)
        {
            return Unauthorized(new { error = "No tenant context found" });
        }

        if (logo == null || logo.Length == 0)
        {
            return BadRequest(new { error = "No file uploaded" });
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(logo.ContentType.ToLower()))
        {
            return BadRequest(new { error = "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." });
        }

        // Validate file size (5MB limit)
        if (logo.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { error = "File size exceeds 5MB limit" });
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId.Value);

        if (tenant == null)
        {
            return NotFound(new { error = "Tenant not found" });
        }

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "logos");
            Directory.CreateDirectory(uploadsPath);

            // Generate unique filename
            var fileExtension = Path.GetExtension(logo.FileName);
            var fileName = $"{tenant.Slug}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await logo.CopyToAsync(stream);
            }

            // Delete old logo if it exists
            if (!string.IsNullOrEmpty(tenant.LogoUrl))
            {
                var oldLogoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", tenant.LogoUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldLogoPath))
                {
                    System.IO.File.Delete(oldLogoPath);
                }
            }

            // Update tenant logo URL
            tenant.LogoUrl = $"/uploads/logos/{fileName}";
            tenant.UpdatedAt = DateTime.UtcNow;

            // Update branding settings JSON
            var brandingSettings = string.IsNullOrEmpty(tenant.BrandingSettings)
                ? new BrandingSettings()
                : JsonSerializer.Deserialize<BrandingSettings>(tenant.BrandingSettings) ?? new BrandingSettings();
            brandingSettings.LogoUrl = tenant.LogoUrl;
            tenant.BrandingSettings = JsonSerializer.Serialize(brandingSettings);

            await _context.SaveChangesAsync();

            return Ok(new LogoUploadResponse { LogoUrl = tenant.LogoUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Failed to upload logo: {ex.Message}" });
        }
    }
}
