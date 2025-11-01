using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.DTOs;
using System.Text.Json;

namespace MechanicShopAPI.Controllers;

/// <summary>
/// Public-facing API for tenant landing pages (no authentication required)
/// </summary>
[EnableCors("AllowPublicAccess")]
[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly MechanicShopContext _context;
    private readonly ILogger<PublicController> _logger;

    public PublicController(MechanicShopContext context, ILogger<PublicController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get public site settings for a tenant by slug
    /// Used for rendering tenant's public landing page
    /// </summary>
    /// <param name="slug">Tenant slug (e.g., "caleb" from caleb.yourapp.com)</param>
    /// <returns>Public site settings</returns>
    [HttpGet("{slug}")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)] // No cache during dev
    public async Task<ActionResult<PublicSiteSettingsDto>> GetPublicSettings(string slug)
    {
        try
        {
            // Find active tenant by slug
            var tenant = await _context.Tenants
                .Where(t => t.Slug == slug.ToLower())
                .Where(t => t.Status == Models.TenantStatus.Active || t.Status == Models.TenantStatus.Trial)
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                _logger.LogWarning("Public page requested for non-existent or inactive tenant: {Slug}", slug);
                return NotFound(new { error = "Shop not found" });
            }

            // Get or create site settings
            var siteSettings = await _context.SiteSettings
                .FirstOrDefaultAsync(s => s.TenantId == tenant.Id);

            if (siteSettings == null)
            {
                // Create default site settings if they don't exist
                siteSettings = new Models.SiteSettings { TenantId = tenant.Id };
                _context.SiteSettings.Add(siteSettings);
                await _context.SaveChangesAsync();
            }

            // Map to public DTO (excludes sensitive information)
            var publicDto = MapToPublicDto(tenant, siteSettings);

            return Ok(publicDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching public settings for slug: {Slug}", slug);
            return StatusCode(500, new { error = "Failed to load shop information" });
        }
    }

    /// <summary>
    /// Submit contact form from public landing page
    /// </summary>
    /// <param name="slug">Tenant slug</param>
    /// <param name="contactForm">Contact form data</param>
    /// <returns>Success confirmation</returns>
    [HttpPost("{slug}/contact")]
    public async Task<ActionResult> SubmitContactForm(string slug, [FromBody] PublicContactFormDto contactForm)
    {
        try
        {
            var tenant = await _context.Tenants
                .Where(t => t.Slug == slug.ToLower())
                .Where(t => t.Status == Models.TenantStatus.Active || t.Status == Models.TenantStatus.Trial)
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                return NotFound(new { error = "Shop not found" });
            }

            // TODO: Implement contact form handling
            // Options:
            // 1. Send email to tenant.Email
            // 2. Create a lead/inquiry record in database
            // 3. Integrate with notification service
            // 4. Create a Customer record if email doesn't exist

            _logger.LogInformation(
                "Contact form submission for tenant {TenantId}: {Name} <{Email}>",
                tenant.Id,
                contactForm.Name,
                contactForm.Email
            );

            // For now, just log it
            // In production, you'd send an email or create a lead record

            return Ok(new
            {
                message = "Thank you for your message! We'll get back to you soon.",
                success = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting contact form for slug: {Slug}", slug);
            return StatusCode(500, new { error = "Failed to submit form" });
        }
    }

    /// <summary>
    /// Maps Tenant + SiteSettings to public DTO (excludes sensitive data)
    /// </summary>
    private static PublicSiteSettingsDto MapToPublicDto(Models.Tenant tenant, Models.SiteSettings siteSettings)
    {
        // Parse availability rules to get business hours
        var businessHours = new List<BusinessHourDto>();

        if (!string.IsNullOrEmpty(tenant.AvailabilityRules))
        {
            try
            {
                var availabilityRules = JsonSerializer.Deserialize<AvailabilityRulesDto>(tenant.AvailabilityRules);
                if (availabilityRules?.WeeklySchedule != null)
                {
                    var schedule = availabilityRules.WeeklySchedule;
                    businessHours = new List<BusinessHourDto>
                    {
                        new() { Day = "Monday", IsOpen = schedule.Monday?.IsOpen ?? false, OpenTime = schedule.Monday?.OpenTime, CloseTime = schedule.Monday?.CloseTime },
                        new() { Day = "Tuesday", IsOpen = schedule.Tuesday?.IsOpen ?? false, OpenTime = schedule.Tuesday?.OpenTime, CloseTime = schedule.Tuesday?.CloseTime },
                        new() { Day = "Wednesday", IsOpen = schedule.Wednesday?.IsOpen ?? false, OpenTime = schedule.Wednesday?.OpenTime, CloseTime = schedule.Wednesday?.CloseTime },
                        new() { Day = "Thursday", IsOpen = schedule.Thursday?.IsOpen ?? false, OpenTime = schedule.Thursday?.OpenTime, CloseTime = schedule.Thursday?.CloseTime },
                        new() { Day = "Friday", IsOpen = schedule.Friday?.IsOpen ?? false, OpenTime = schedule.Friday?.OpenTime, CloseTime = schedule.Friday?.CloseTime },
                        new() { Day = "Saturday", IsOpen = schedule.Saturday?.IsOpen ?? false, OpenTime = schedule.Saturday?.OpenTime, CloseTime = schedule.Saturday?.CloseTime },
                        new() { Day = "Sunday", IsOpen = schedule.Sunday?.IsOpen ?? false, OpenTime = schedule.Sunday?.OpenTime, CloseTime = schedule.Sunday?.CloseTime }
                    };
                }
            }
            catch
            {
                // If parsing fails, leave business hours empty
            }
        }

        return new PublicSiteSettingsDto
        {
            // Business Info (from Tenant)
            BusinessName = tenant.Name,
            Description = tenant.Description,
            Phone = tenant.Phone,
            Email = tenant.Email,
            Website = tenant.Website,

            // Address (from Tenant)
            Address = tenant.BusinessAddress,
            City = tenant.City,
            State = tenant.State,
            ZipCode = tenant.ZipCode,
            Country = tenant.Country,

            // Branding (from Tenant)
            LogoUrl = tenant.LogoUrl,
            PrimaryColor = GetPrimaryColor(tenant),

            // Stats (from SiteSettings)
            Tagline = siteSettings.Tagline,
            VehiclesServiced = siteSettings.VehiclesServiced,
            SatisfactionRate = siteSettings.SatisfactionRate,
            YearsExperience = siteSettings.YearsExperience,

            // Hero Section (from SiteSettings)
            HeroTitle = siteSettings.HeroTitle,
            HeroSubtitle = siteSettings.HeroSubtitle,
            PrimaryCtaText = siteSettings.PrimaryCtaText,
            SecondaryCtaText = siteSettings.SecondaryCtaText,
            HeroImageUrl = siteSettings.HeroImageUrl,

            // Service 1 (from SiteSettings)
            Service1Title = siteSettings.Service1Title,
            Service1Description = siteSettings.Service1Description,
            Service1Feature1 = siteSettings.Service1Feature1,
            Service1Feature2 = siteSettings.Service1Feature2,
            Service1Feature3 = siteSettings.Service1Feature3,
            Service1Feature4 = siteSettings.Service1Feature4,
            Service1ImageUrl = siteSettings.Service1ImageUrl,

            // Service 2 (from SiteSettings)
            Service2Title = siteSettings.Service2Title,
            Service2Description = siteSettings.Service2Description,
            Service2Feature1 = siteSettings.Service2Feature1,
            Service2Feature2 = siteSettings.Service2Feature2,
            Service2Feature3 = siteSettings.Service2Feature3,
            Service2Feature4 = siteSettings.Service2Feature4,
            Service2ImageUrl = siteSettings.Service2ImageUrl,

            // Service 3 (from SiteSettings)
            Service3Title = siteSettings.Service3Title,
            Service3Description = siteSettings.Service3Description,
            Service3Feature1 = siteSettings.Service3Feature1,
            Service3Feature2 = siteSettings.Service3Feature2,
            Service3Feature3 = siteSettings.Service3Feature3,
            Service3Feature4 = siteSettings.Service3Feature4,
            Service3ImageUrl = siteSettings.Service3ImageUrl,

            // Why Choose Us (from SiteSettings)
            WhyFeature1Title = siteSettings.WhyFeature1Title,
            WhyFeature1Description = siteSettings.WhyFeature1Description,
            WhyFeature2Title = siteSettings.WhyFeature2Title,
            WhyFeature2Description = siteSettings.WhyFeature2Description,
            WhyFeature3Title = siteSettings.WhyFeature3Title,
            WhyFeature3Description = siteSettings.WhyFeature3Description,
            WhyFeature4Title = siteSettings.WhyFeature4Title,
            WhyFeature4Description = siteSettings.WhyFeature4Description,

            // CTA Section (from SiteSettings)
            CtaTitle = siteSettings.CtaTitle,
            CtaSubtitle = siteSettings.CtaSubtitle,
            CtaButtonText = siteSettings.CtaButtonText,

            // Meta
            BusinessHours = businessHours,
            BookingEnabled = tenant.BookingEnabled,
            TimeZone = tenant.TimeZone
        };
    }

    /// <summary>
    /// Extract primary color from tenant's integration settings
    /// </summary>
    private static string? GetPrimaryColor(Models.Tenant tenant)
    {
        if (string.IsNullOrEmpty(tenant.IntegrationSettings))
            return null;

        try
        {
            var settings = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(tenant.IntegrationSettings);
            if (settings != null && settings.TryGetValue("primaryColor", out var colorElement))
            {
                return colorElement.GetString();
            }
        }
        catch
        {
            // Ignore parsing errors
        }

        return null;
    }
}
