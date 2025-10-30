using MechanicShopAPI.Data;
using MechanicShopAPI.Services;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MechanicShopAPI.Middleware;

/// <summary>
/// Middleware that resolves the current tenant from JWT claims, route slug, or header
/// </summary>
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolutionMiddleware> _logger;

    public TenantResolutionMiddleware(
        RequestDelegate next,
        ILogger<TenantResolutionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenantAccessor tenantAccessor,
        MechanicShopContext dbContext)
    {
        string? tenantIdentifier = null;
        string? resolvedFrom = null;

        // Strategy 1: Try to get tenant from JWT claim "tenant_id" or "tenant_slug"
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var tenantIdClaim = context.User.FindFirst("tenant_id")?.Value;
            var tenantSlugClaim = context.User.FindFirst("tenant_slug")?.Value;

            if (!string.IsNullOrEmpty(tenantIdClaim))
            {
                tenantIdentifier = tenantIdClaim;
                resolvedFrom = "JWT:tenant_id";
            }
            else if (!string.IsNullOrEmpty(tenantSlugClaim))
            {
                tenantIdentifier = tenantSlugClaim;
                resolvedFrom = "JWT:tenant_slug";
            }
        }

        // Strategy 2: Try to get tenant from route parameter {tenantSlug}
        if (string.IsNullOrEmpty(tenantIdentifier))
        {
            if (context.Request.RouteValues.TryGetValue("tenantSlug", out var routeSlug))
            {
                tenantIdentifier = routeSlug?.ToString();
                resolvedFrom = "Route:tenantSlug";
            }
        }

        // Strategy 3: Try to get tenant from custom header X-Tenant-Slug
        if (string.IsNullOrEmpty(tenantIdentifier))
        {
            if (context.Request.Headers.TryGetValue("X-Tenant-Slug", out var headerSlug))
            {
                tenantIdentifier = headerSlug.FirstOrDefault();
                resolvedFrom = "Header:X-Tenant-Slug";
            }
        }

        // Strategy 4: Try to get tenant from subdomain (e.g., precision-auto.example.com)
        if (string.IsNullOrEmpty(tenantIdentifier))
        {
            var host = context.Request.Host.Host;
            var parts = host.Split('.');

            // If we have subdomain.domain.tld (3+ parts), extract subdomain
            if (parts.Length >= 3 && parts[0] != "www")
            {
                tenantIdentifier = parts[0];
                resolvedFrom = "Subdomain";
            }
        }

        // If we found a tenant identifier, resolve it to a tenant
        if (!string.IsNullOrEmpty(tenantIdentifier))
        {
            try
            {
                // Try to parse as int (tenant ID)
                if (int.TryParse(tenantIdentifier, out var tenantId))
                {
                    var tenant = await dbContext.Set<Models.Tenant>()
                        .Where(t => t.Id == tenantId && t.Status == Models.TenantStatus.Active)
                        .Select(t => new { t.Id, t.Slug })
                        .FirstOrDefaultAsync();

                    if (tenant != null)
                    {
                        tenantAccessor.SetTenant(tenant.Id, tenant.Slug);
                        _logger.LogInformation(
                            "Tenant resolved: ID={TenantId}, Slug={TenantSlug}, Source={Source}",
                            tenant.Id, tenant.Slug, resolvedFrom);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Tenant ID {TenantId} not found or inactive. Source={Source}",
                            tenantId, resolvedFrom);
                        context.Response.StatusCode = 404;
                        await context.Response.WriteAsJsonAsync(new { error = "Tenant not found" });
                        return;
                    }
                }
                else
                {
                    // Resolve by slug
                    var tenant = await dbContext.Set<Models.Tenant>()
                        .Where(t => t.Slug == tenantIdentifier && t.Status == Models.TenantStatus.Active)
                        .Select(t => new { t.Id, t.Slug })
                        .FirstOrDefaultAsync();

                    if (tenant != null)
                    {
                        tenantAccessor.SetTenant(tenant.Id, tenant.Slug);
                        _logger.LogInformation(
                            "Tenant resolved: ID={TenantId}, Slug={TenantSlug}, Source={Source}",
                            tenant.Id, tenant.Slug, resolvedFrom);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Tenant slug '{TenantSlug}' not found or inactive. Source={Source}",
                            tenantIdentifier, resolvedFrom);
                        context.Response.StatusCode = 404;
                        await context.Response.WriteAsJsonAsync(new { error = "Tenant not found" });
                        return;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving tenant: {TenantIdentifier}", tenantIdentifier);
                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(new { error = "Error resolving tenant" });
                return;
            }
        }
        else
        {
            // No tenant identifier found - this might be OK for public endpoints
            _logger.LogDebug("No tenant identifier found in request");
        }

        try
        {
            await _next(context);
        }
        finally
        {
            // Clean up tenant context after request
            tenantAccessor.ClearTenant();
        }
    }
}

/// <summary>
/// Extension methods for registering tenant resolution middleware
/// </summary>
public static class TenantResolutionMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantResolution(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<TenantResolutionMiddleware>();
    }
}
