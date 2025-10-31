using System.ComponentModel.DataAnnotations;
using MechanicShopAPI.Models;

namespace MechanicShopAPI.DTOs;

/// <summary>
/// Step 1: Business information
/// </summary>
public class OnboardingStep1Request
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string BusinessName { get; set; } = string.Empty;

    [StringLength(100, MinimumLength = 3, ErrorMessage = "Slug must be between 3 and 30 characters")]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Slug can only contain lowercase letters, numbers, and hyphens")]
    public string? Slug { get; set; } // Optional - will be auto-generated if not provided

    [Required]
    [StringLength(200)]
    public string BusinessAddress { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string State { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string ZipCode { get; set; } = string.Empty;

    [Phone]
    public string? Phone { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    public string? Website { get; set; }
    public string? Description { get; set; }
}

/// <summary>
/// Step 2: Availability and hours
/// </summary>
public class OnboardingStep2Request
{
    [Required]
    public AvailabilityRules AvailabilityRules { get; set; } = new();
}

/// <summary>
/// Step 3: First service item
/// </summary>
public class OnboardingStep3Request
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string ServiceName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? ServiceDescription { get; set; }

    [Required]
    [Range(0, 100000)]
    public decimal BasePrice { get; set; }

    [Required]
    [Range(15, 480)] // 15 minutes to 8 hours
    public int DurationMinutes { get; set; } = 60;

    public ServiceCategory Category { get; set; } = ServiceCategory.General;
}

/// <summary>
/// Complete onboarding in one request (optional - for API clients)
/// </summary>
public class CompleteOnboardingRequest
{
    [Required]
    public OnboardingStep1Request BusinessInfo { get; set; } = new();

    [Required]
    public OnboardingStep2Request Availability { get; set; } = new();

    [Required]
    public OnboardingStep3Request FirstService { get; set; } = new();
}

/// <summary>
/// Onboarding status response
/// </summary>
public class OnboardingStatusResponse
{
    public bool IsCompleted { get; set; }
    public int CurrentStep { get; set; }
    public DateTime? CompletedAt { get; set; }
    public TenantSummary? Tenant { get; set; }
    public string? PublicBookingUrl { get; set; }
}

/// <summary>
/// Tenant summary for onboarding response
/// </summary>
public class TenantSummary
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool BookingEnabled { get; set; }
    public int ServiceItemCount { get; set; }
}

/// <summary>
/// Slug validation request
/// </summary>
public class SlugCheckRequest
{
    [Required]
    [StringLength(30, MinimumLength = 3)]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Slug can only contain lowercase letters, numbers, and hyphens")]
    public string Slug { get; set; } = string.Empty;
}

/// <summary>
/// Slug validation response
/// </summary>
public class SlugCheckResponse
{
    public bool IsAvailable { get; set; }
    public string? Message { get; set; }
    public string? SuggestedSlug { get; set; }
}
