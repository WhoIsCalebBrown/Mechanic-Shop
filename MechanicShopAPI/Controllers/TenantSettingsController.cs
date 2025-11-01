using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.DTOs;
using MechanicShopAPI.Services;
using System.Text.Json;

namespace MechanicShopAPI.Controllers;

/// <summary>
/// Controller for managing tenant-specific settings
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
    /// Get current tenant's settings
    /// </summary>
    /// <returns>Tenant settings</returns>
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

        return Ok(MapToDto(tenant));
    }

    /// <summary>
    /// Update current tenant's settings
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

        // Update Business Profile
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

        // Update Branding
        if (updateDto.LogoUrl != null) tenant.LogoUrl = updateDto.LogoUrl;

        // Update Availability Rules (serialize to JSON)
        if (updateDto.AvailabilityRules != null)
        {
            tenant.AvailabilityRules = JsonSerializer.Serialize(updateDto.AvailabilityRules);
        }

        // Update Integration Settings to include notifications
        if (updateDto.Notifications != null)
        {
            var integrationSettings = string.IsNullOrEmpty(tenant.IntegrationSettings)
                ? new Dictionary<string, object>()
                : JsonSerializer.Deserialize<Dictionary<string, object>>(tenant.IntegrationSettings)
                  ?? new Dictionary<string, object>();

            integrationSettings["notifications"] = updateDto.Notifications;
            tenant.IntegrationSettings = JsonSerializer.Serialize(integrationSettings);
        }

        // Store primary color in IntegrationSettings (for now, can be moved to Tenant model later)
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

        try
        {
            await _context.SaveChangesAsync();
            return Ok(MapToDto(tenant));
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { error = "Failed to update tenant settings", details = ex.Message });
        }
    }

    /// <summary>
    /// Maps Tenant entity to TenantSettingsDto
    /// </summary>
    private static TenantSettingsDto MapToDto(Models.Tenant tenant)
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
                // If deserialization fails, use default
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
            UpdatedAt = tenant.UpdatedAt
        };
    }
}
