using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MechanicShopAPI.Models;
using MechanicShopAPI.Data;
using MechanicShopAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace MechanicShopAPI.Authorization;

/// <summary>
/// Authorization attribute that enforces role-based access control
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequireRoleAttribute : Attribute, IAsyncActionFilter
{
    private readonly StaffRole[] _allowedRoles;

    public RequireRoleAttribute(params StaffRole[] allowedRoles)
    {
        _allowedRoles = allowedRoles ?? Array.Empty<StaffRole>();
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var tenantAccessor = context.HttpContext.RequestServices.GetService<ITenantAccessor>();
        var dbContext = context.HttpContext.RequestServices.GetService<MechanicShopContext>();

        if (tenantAccessor == null || dbContext == null)
        {
            context.Result = new StatusCodeResult(500);
            return;
        }

        // Check if tenant context is set
        if (!tenantAccessor.TenantId.HasValue)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                error = "Tenant context is required"
            });
            return;
        }

        // Get user ID from claims (assuming you have authentication set up)
        var userIdClaim = context.HttpContext.User.FindFirst("staff_id")?.Value
                          ?? context.HttpContext.User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                error = "User authentication required"
            });
            return;
        }

        // Try to parse staff ID
        if (!int.TryParse(userIdClaim, out var staffId))
        {
            // If not an integer, try to find by UserId
            var staffByUserId = await dbContext.Set<Staff>()
                .FirstOrDefaultAsync(s => s.UserId == userIdClaim && s.TenantId == tenantAccessor.TenantId.Value);

            if (staffByUserId == null)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    error = "Staff member not found"
                });
                return;
            }

            staffId = staffByUserId.Id;
        }

        // Get staff member and check role
        var staff = await dbContext.Set<Staff>()
            .FirstOrDefaultAsync(s => s.Id == staffId && s.TenantId == tenantAccessor.TenantId.Value);

        if (staff == null)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                error = "Staff member not found or not part of this tenant"
            });
            return;
        }

        // Check if staff is active
        if (staff.Status != StaffStatus.Active)
        {
            context.Result = new ForbidResult();
            return;
        }

        // Check if staff has required role
        if (_allowedRoles.Length > 0 && !_allowedRoles.Contains(staff.Role))
        {
            context.Result = new ForbidObjectResult(new
            {
                error = $"This action requires one of the following roles: {string.Join(", ", _allowedRoles)}",
                requiredRoles = _allowedRoles.Select(r => r.ToString()).ToArray(),
                userRole = staff.Role.ToString()
            });
            return;
        }

        // Store staff info in HttpContext for use in controllers
        context.HttpContext.Items["CurrentStaff"] = staff;
        context.HttpContext.Items["CurrentStaffRole"] = staff.Role;

        await next();
    }
}

/// <summary>
/// Shorthand attributes for specific roles
/// </summary>
public class RequireOwnerAttribute : RequireRoleAttribute
{
    public RequireOwnerAttribute() : base(StaffRole.Owner) { }
}

public class RequireManagerOrOwnerAttribute : RequireRoleAttribute
{
    public RequireManagerOrOwnerAttribute() : base(StaffRole.Owner, StaffRole.Manager) { }
}

public class RequireDispatcherAttribute : RequireRoleAttribute
{
    public RequireDispatcherAttribute() : base(StaffRole.Owner, StaffRole.Manager, StaffRole.Dispatcher) { }
}

public class RequireTechnicianAttribute : RequireRoleAttribute
{
    public RequireTechnicianAttribute() : base(StaffRole.Owner, StaffRole.Manager, StaffRole.Technician) { }
}

/// <summary>
/// Helper class for forbidden results with body
/// </summary>
public class ForbidObjectResult : ObjectResult
{
    public ForbidObjectResult(object value) : base(value)
    {
        StatusCode = 403;
    }
}
