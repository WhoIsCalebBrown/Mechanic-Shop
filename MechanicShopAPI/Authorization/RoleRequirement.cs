using Microsoft.AspNetCore.Authorization;
using MechanicShopAPI.Models;

namespace MechanicShopAPI.Authorization;

/// <summary>
/// Authorization requirement for staff roles
/// </summary>
public class RoleRequirement : IAuthorizationRequirement
{
    public StaffRole[] AllowedRoles { get; }

    public RoleRequirement(params StaffRole[] allowedRoles)
    {
        AllowedRoles = allowedRoles;
    }
}

/// <summary>
/// Handler for role-based authorization
/// </summary>
public class RoleRequirementHandler : AuthorizationHandler<RoleRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RoleRequirement requirement)
    {
        // Get the staff_role claim from JWT
        var roleClaim = context.User.FindFirst("staff_role");
        if (roleClaim == null)
        {
            return Task.CompletedTask;
        }

        // Parse the role
        if (!Enum.TryParse<StaffRole>(roleClaim.Value, out var userRole))
        {
            return Task.CompletedTask;
        }

        // Check if user has one of the allowed roles
        if (requirement.AllowedRoles.Contains(userRole))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
