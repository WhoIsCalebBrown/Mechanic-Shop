using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.DTOs;
using MechanicShopAPI.Models;
using MechanicShopAPI.Services;
using System.Text.Json;

namespace MechanicShopAPI.Controllers;

/// <summary>
/// Unified controller for managing all tenant settings (operational + public profile)
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TenantSettingsController : TenantAwareControllerBase
{
    private readonly MechanicShopContext _context;

    public TenantSettingsController(
        MechanicShopContext context,
        ITenantAccessor tenantAccessor) : base(tenantAccessor)
    {
        _context = context;
    }

    /// <summary>
    /// Get current tenant's unified settings (operational + public profile)
    /// </summary>
    /// <returns>Complete tenant settings</returns>
    [HttpGet]
    public async Task<ActionResult<TenantSettingsDto>> GetTenantSettings()
    {
        if (!HasTenantContext)
        {
            return StatusCode(403, new { error = "Tenant context is required for this operation" });
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == CurrentTenantId);

        if (tenant == null)
        {
            return NotFound(new { error = "Tenant not found or not active" });
        }

        // Get or create SiteSettings for this tenant
        var siteSettings = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.TenantId == CurrentTenantId);

        if (siteSettings == null)
        {
            // Create default site settings for this tenant
            siteSettings = new SiteSettings { TenantId = CurrentTenantId };
            _context.SiteSettings.Add(siteSettings);
            await _context.SaveChangesAsync();
        }

        return Ok(MapToDto(tenant, siteSettings));
    }

    /// <summary>
    /// Update current tenant's unified settings
    /// </summary>
    /// <param name="updateDto">Settings to update</param>
    /// <returns>Updated tenant settings</returns>
    [HttpPut]
    public async Task<ActionResult<TenantSettingsDto>> UpdateTenantSettings(UpdateTenantSettingsDto updateDto)
    {
        if (!HasTenantContext)
        {
            return StatusCode(403, new { error = "Tenant context is required for this operation" });
        }

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == CurrentTenantId);

        if (tenant == null)
        {
            return NotFound(new { error = "Tenant not found or not active" });
        }

        // Get or create SiteSettings
        var siteSettings = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.TenantId == CurrentTenantId);

        if (siteSettings == null)
        {
            siteSettings = new SiteSettings { TenantId = CurrentTenantId };
            _context.SiteSettings.Add(siteSettings);
        }

        // Update Tenant (Operational Settings)
        if (updateDto.Name != null) tenant.Name = updateDto.Name;
        if (updateDto.BusinessAddress != null) tenant.BusinessAddress = updateDto.BusinessAddress;
        if (updateDto.City != null) tenant.City = updateDto.City;
        if (updateDto.State != null) tenant.State = updateDto.State;
        if (updateDto.ZipCode != null) tenant.ZipCode = updateDto.ZipCode;
        if (updateDto.Country != null) tenant.Country = updateDto.Country;
        if (updateDto.Phone != null) tenant.Phone = updateDto.Phone;
        if (updateDto.Email != null) tenant.Email = updateDto.Email;
        if (updateDto.Website != null) tenant.Website = updateDto.Website;
        if (updateDto.Description != null) tenant.Description = updateDto.Description;
        if (updateDto.TimeZone != null) tenant.TimeZone = updateDto.TimeZone;
        if (updateDto.LogoUrl != null) tenant.LogoUrl = updateDto.LogoUrl;

        // Update Availability Rules
        if (updateDto.AvailabilityRules != null)
        {
            tenant.AvailabilityRules = JsonSerializer.Serialize(updateDto.AvailabilityRules);
        }

        // Update Notifications in IntegrationSettings
        if (updateDto.Notifications != null)
        {
            var integrationSettings = string.IsNullOrEmpty(tenant.IntegrationSettings)
                ? new Dictionary<string, object>()
                : JsonSerializer.Deserialize<Dictionary<string, object>>(tenant.IntegrationSettings)
                  ?? new Dictionary<string, object>();

            integrationSettings["notifications"] = updateDto.Notifications;
            tenant.IntegrationSettings = JsonSerializer.Serialize(integrationSettings);
        }

        // Update Primary Color in IntegrationSettings
        if (updateDto.PrimaryColor != null)
        {
            var integrationSettings = string.IsNullOrEmpty(tenant.IntegrationSettings)
                ? new Dictionary<string, object>()
                : JsonSerializer.Deserialize<Dictionary<string, object>>(tenant.IntegrationSettings)
                  ?? new Dictionary<string, object>();

            integrationSettings["primaryColor"] = updateDto.PrimaryColor;
            tenant.IntegrationSettings = JsonSerializer.Serialize(integrationSettings);
        }

        tenant.UpdatedAt = DateTime.UtcNow;

        // Update SiteSettings (Public Profile)
        if (updateDto.Tagline != null) siteSettings.Tagline = updateDto.Tagline;
        if (updateDto.VehiclesServiced.HasValue) siteSettings.VehiclesServiced = updateDto.VehiclesServiced.Value;
        if (updateDto.SatisfactionRate.HasValue) siteSettings.SatisfactionRate = updateDto.SatisfactionRate.Value;
        if (updateDto.YearsExperience.HasValue) siteSettings.YearsExperience = updateDto.YearsExperience.Value;

        // Hero Section
        if (updateDto.HeroTitle != null) siteSettings.HeroTitle = updateDto.HeroTitle;
        if (updateDto.HeroSubtitle != null) siteSettings.HeroSubtitle = updateDto.HeroSubtitle;
        if (updateDto.PrimaryCtaText != null) siteSettings.PrimaryCtaText = updateDto.PrimaryCtaText;
        if (updateDto.SecondaryCtaText != null) siteSettings.SecondaryCtaText = updateDto.SecondaryCtaText;
        if (updateDto.HeroImageUrl != null) siteSettings.HeroImageUrl = updateDto.HeroImageUrl;

        // Services
        if (updateDto.Service1Title != null) siteSettings.Service1Title = updateDto.Service1Title;
        if (updateDto.Service1Description != null) siteSettings.Service1Description = updateDto.Service1Description;
        if (updateDto.Service1Feature1 != null) siteSettings.Service1Feature1 = updateDto.Service1Feature1;
        if (updateDto.Service1Feature2 != null) siteSettings.Service1Feature2 = updateDto.Service1Feature2;
        if (updateDto.Service1Feature3 != null) siteSettings.Service1Feature3 = updateDto.Service1Feature3;
        if (updateDto.Service1Feature4 != null) siteSettings.Service1Feature4 = updateDto.Service1Feature4;
        if (updateDto.Service1ImageUrl != null) siteSettings.Service1ImageUrl = updateDto.Service1ImageUrl;

        if (updateDto.Service2Title != null) siteSettings.Service2Title = updateDto.Service2Title;
        if (updateDto.Service2Description != null) siteSettings.Service2Description = updateDto.Service2Description;
        if (updateDto.Service2Feature1 != null) siteSettings.Service2Feature1 = updateDto.Service2Feature1;
        if (updateDto.Service2Feature2 != null) siteSettings.Service2Feature2 = updateDto.Service2Feature2;
        if (updateDto.Service2Feature3 != null) siteSettings.Service2Feature3 = updateDto.Service2Feature3;
        if (updateDto.Service2Feature4 != null) siteSettings.Service2Feature4 = updateDto.Service2Feature4;
        if (updateDto.Service2ImageUrl != null) siteSettings.Service2ImageUrl = updateDto.Service2ImageUrl;

        if (updateDto.Service3Title != null) siteSettings.Service3Title = updateDto.Service3Title;
        if (updateDto.Service3Description != null) siteSettings.Service3Description = updateDto.Service3Description;
        if (updateDto.Service3Feature1 != null) siteSettings.Service3Feature1 = updateDto.Service3Feature1;
        if (updateDto.Service3Feature2 != null) siteSettings.Service3Feature2 = updateDto.Service3Feature2;
        if (updateDto.Service3Feature3 != null) siteSettings.Service3Feature3 = updateDto.Service3Feature3;
        if (updateDto.Service3Feature4 != null) siteSettings.Service3Feature4 = updateDto.Service3Feature4;
        if (updateDto.Service3ImageUrl != null) siteSettings.Service3ImageUrl = updateDto.Service3ImageUrl;

        // Why Choose Us
        if (updateDto.WhyFeature1Title != null) siteSettings.WhyFeature1Title = updateDto.WhyFeature1Title;
        if (updateDto.WhyFeature1Description != null) siteSettings.WhyFeature1Description = updateDto.WhyFeature1Description;
        if (updateDto.WhyFeature2Title != null) siteSettings.WhyFeature2Title = updateDto.WhyFeature2Title;
        if (updateDto.WhyFeature2Description != null) siteSettings.WhyFeature2Description = updateDto.WhyFeature2Description;
        if (updateDto.WhyFeature3Title != null) siteSettings.WhyFeature3Title = updateDto.WhyFeature3Title;
        if (updateDto.WhyFeature3Description != null) siteSettings.WhyFeature3Description = updateDto.WhyFeature3Description;
        if (updateDto.WhyFeature4Title != null) siteSettings.WhyFeature4Title = updateDto.WhyFeature4Title;
        if (updateDto.WhyFeature4Description != null) siteSettings.WhyFeature4Description = updateDto.WhyFeature4Description;

        // CTA Section
        if (updateDto.CtaTitle != null) siteSettings.CtaTitle = updateDto.CtaTitle;
        if (updateDto.CtaSubtitle != null) siteSettings.CtaSubtitle = updateDto.CtaSubtitle;
        if (updateDto.CtaButtonText != null) siteSettings.CtaButtonText = updateDto.CtaButtonText;

        siteSettings.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(MapToDto(tenant, siteSettings));
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { error = "Failed to update tenant settings", details = ex.Message });
        }
    }

    /// <summary>
    /// Maps Tenant + SiteSettings to unified TenantSettingsDto
    /// </summary>
    private static TenantSettingsDto MapToDto(Tenant tenant, SiteSettings siteSettings)
    {
        // Deserialize availability rules
        AvailabilityRulesDto? availabilityRules = null;
        if (!string.IsNullOrEmpty(tenant.AvailabilityRules))
        {
            try
            {
                availabilityRules = JsonSerializer.Deserialize<AvailabilityRulesDto>(tenant.AvailabilityRules);
            }
            catch
            {
                availabilityRules = new AvailabilityRulesDto();
            }
        }

        // Deserialize integration settings for notifications and primary color
        NotificationSettingsDto notifications = new();
        string? primaryColor = null;

        if (!string.IsNullOrEmpty(tenant.IntegrationSettings))
        {
            try
            {
                var integrationSettings = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(tenant.IntegrationSettings);

                if (integrationSettings != null)
                {
                    if (integrationSettings.TryGetValue("notifications", out var notificationsElement))
                    {
                        notifications = JsonSerializer.Deserialize<NotificationSettingsDto>(notificationsElement.GetRawText())
                                       ?? new NotificationSettingsDto();
                    }

                    if (integrationSettings.TryGetValue("primaryColor", out var colorElement))
                    {
                        primaryColor = colorElement.GetString();
                    }
                }
            }
            catch
            {
                // If deserialization fails, use defaults
            }
        }

        return new TenantSettingsDto
        {
            Id = tenant.Id,
            // Operational Settings (from Tenant)
            Name = tenant.Name,
            BusinessAddress = tenant.BusinessAddress,
            City = tenant.City,
            State = tenant.State,
            ZipCode = tenant.ZipCode,
            Country = tenant.Country,
            Phone = tenant.Phone,
            Email = tenant.Email,
            Website = tenant.Website,
            Description = tenant.Description,
            TimeZone = tenant.TimeZone,
            LogoUrl = tenant.LogoUrl,
            PrimaryColor = primaryColor,
            Notifications = notifications,
            AvailabilityRules = availabilityRules,

            // Public Profile (from SiteSettings)
            Tagline = siteSettings.Tagline,
            VehiclesServiced = siteSettings.VehiclesServiced,
            SatisfactionRate = siteSettings.SatisfactionRate,
            YearsExperience = siteSettings.YearsExperience,

            HeroTitle = siteSettings.HeroTitle,
            HeroSubtitle = siteSettings.HeroSubtitle,
            PrimaryCtaText = siteSettings.PrimaryCtaText,
            SecondaryCtaText = siteSettings.SecondaryCtaText,
            HeroImageUrl = siteSettings.HeroImageUrl,

            Service1Title = siteSettings.Service1Title,
            Service1Description = siteSettings.Service1Description,
            Service1Feature1 = siteSettings.Service1Feature1,
            Service1Feature2 = siteSettings.Service1Feature2,
            Service1Feature3 = siteSettings.Service1Feature3,
            Service1Feature4 = siteSettings.Service1Feature4,
            Service1ImageUrl = siteSettings.Service1ImageUrl,

            Service2Title = siteSettings.Service2Title,
            Service2Description = siteSettings.Service2Description,
            Service2Feature1 = siteSettings.Service2Feature1,
            Service2Feature2 = siteSettings.Service2Feature2,
            Service2Feature3 = siteSettings.Service2Feature3,
            Service2Feature4 = siteSettings.Service2Feature4,
            Service2ImageUrl = siteSettings.Service2ImageUrl,

            Service3Title = siteSettings.Service3Title,
            Service3Description = siteSettings.Service3Description,
            Service3Feature1 = siteSettings.Service3Feature1,
            Service3Feature2 = siteSettings.Service3Feature2,
            Service3Feature3 = siteSettings.Service3Feature3,
            Service3Feature4 = siteSettings.Service3Feature4,
            Service3ImageUrl = siteSettings.Service3ImageUrl,

            WhyFeature1Title = siteSettings.WhyFeature1Title,
            WhyFeature1Description = siteSettings.WhyFeature1Description,
            WhyFeature2Title = siteSettings.WhyFeature2Title,
            WhyFeature2Description = siteSettings.WhyFeature2Description,
            WhyFeature3Title = siteSettings.WhyFeature3Title,
            WhyFeature3Description = siteSettings.WhyFeature3Description,
            WhyFeature4Title = siteSettings.WhyFeature4Title,
            WhyFeature4Description = siteSettings.WhyFeature4Description,

            CtaTitle = siteSettings.CtaTitle,
            CtaSubtitle = siteSettings.CtaSubtitle,
            CtaButtonText = siteSettings.CtaButtonText,

            UpdatedAt = tenant.UpdatedAt
        };
    }
}
