namespace MechanicShopAPI.Services;

/// <summary>
/// Implementation of ITenantAccessor using AsyncLocal for thread-safe ambient context
/// </summary>
public class TenantAccessor : ITenantAccessor
{
    private static readonly AsyncLocal<TenantContext?> _tenantContext = new();

    public int? TenantId => _tenantContext.Value?.TenantId;

    public string? TenantSlug => _tenantContext.Value?.TenantSlug;

    public void SetTenant(int tenantId, string tenantSlug)
    {
        _tenantContext.Value = new TenantContext
        {
            TenantId = tenantId,
            TenantSlug = tenantSlug
        };
    }

    public void ClearTenant()
    {
        _tenantContext.Value = null;
    }

    private class TenantContext
    {
        public int TenantId { get; set; }
        public string TenantSlug { get; set; } = string.Empty;
    }
}
