using Microsoft.AspNetCore.Mvc;
using MechanicShopAPI.Services;

namespace MechanicShopAPI.Controllers;

/// <summary>
/// Base controller that provides tenant context to derived controllers
/// </summary>
[ApiController]
[Route("api/[controller]")]
public abstract class TenantAwareControllerBase : ControllerBase
{
    protected readonly ITenantAccessor TenantAccessor;

    protected TenantAwareControllerBase(ITenantAccessor tenantAccessor)
    {
        TenantAccessor = tenantAccessor;
    }

    /// <summary>
    /// Gets the current tenant ID, or throws if no tenant is set
    /// </summary>
    protected int CurrentTenantId
    {
        get
        {
            if (!TenantAccessor.TenantId.HasValue)
            {
                throw new InvalidOperationException("Tenant context is not set");
            }
            return TenantAccessor.TenantId.Value;
        }
    }

    /// <summary>
    /// Gets the current tenant slug, or throws if no tenant is set
    /// </summary>
    protected string CurrentTenantSlug
    {
        get
        {
            if (string.IsNullOrEmpty(TenantAccessor.TenantSlug))
            {
                throw new InvalidOperationException("Tenant context is not set");
            }
            return TenantAccessor.TenantSlug;
        }
    }

    /// <summary>
    /// Checks if a tenant context is currently set
    /// </summary>
    protected bool HasTenantContext => TenantAccessor.TenantId.HasValue;

    /// <summary>
    /// Returns a 404 response with a tenant-specific message
    /// </summary>
    protected IActionResult TenantNotFoundResult()
    {
        return NotFound(new { error = "Tenant not found or not active" });
    }

    /// <summary>
    /// Returns a 403 response when tenant context is required but missing
    /// </summary>
    protected IActionResult TenantRequiredResult()
    {
        return StatusCode(403, new { error = "Tenant context is required for this operation" });
    }
}
