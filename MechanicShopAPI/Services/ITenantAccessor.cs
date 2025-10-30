namespace MechanicShopAPI.Services;

/// <summary>
/// Service for accessing the current tenant context
/// </summary>
public interface ITenantAccessor
{
    /// <summary>
    /// Gets the current tenant ID from the ambient context
    /// </summary>
    int? TenantId { get; }

    /// <summary>
    /// Gets the current tenant slug from the ambient context
    /// </summary>
    string? TenantSlug { get; }

    /// <summary>
    /// Sets the current tenant context
    /// </summary>
    void SetTenant(int tenantId, string tenantSlug);

    /// <summary>
    /// Clears the tenant context
    /// </summary>
    void ClearTenant();
}
