using Microsoft.AspNetCore.Authorization;

namespace MechanicShopAPI.Authorization;

/// <summary>
/// Authorization requirement to ensure user has a tenant
/// </summary>
public class TenantRequirement : IAuthorizationRequirement
{
}

/// <summary>
/// Handler for tenant-based authorization
/// </summary>
public class TenantRequirementHandler : AuthorizationHandler<TenantRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TenantRequirement requirement)
    {
        // Check if user has tenant_id and tenant_slug claims
        var tenantIdClaim = context.User.FindFirst("tenant_id");
        var tenantSlugClaim = context.User.FindFirst("tenant_slug");

        if (tenantIdClaim != null && tenantSlugClaim != null &&
            int.TryParse(tenantIdClaim.Value, out var tenantId) && tenantId > 0)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
