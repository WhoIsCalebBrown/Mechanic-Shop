using Microsoft.AspNetCore.Authorization;
using MechanicShopAPI.Models;

namespace MechanicShopAPI.Authorization;

/// <summary>
/// Authorization requirement to ensure staff member is active
/// </summary>
public class StaffStatusRequirement : IAuthorizationRequirement
{
    public StaffStatus[] AllowedStatuses { get; }

    public StaffStatusRequirement(params StaffStatus[] allowedStatuses)
    {
        AllowedStatuses = allowedStatuses;
    }
}

/// <summary>
/// Handler for staff status-based authorization
/// </summary>
public class StaffStatusRequirementHandler : AuthorizationHandler<StaffStatusRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        StaffStatusRequirement requirement)
    {
        // Get the staff_status claim from JWT
        var statusClaim = context.User.FindFirst("staff_status");
        if (statusClaim == null)
        {
            return Task.CompletedTask;
        }

        // Parse the status
        if (!Enum.TryParse<StaffStatus>(statusClaim.Value, out var userStatus))
        {
            return Task.CompletedTask;
        }

        // Check if user has one of the allowed statuses
        if (requirement.AllowedStatuses.Contains(userStatus))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
