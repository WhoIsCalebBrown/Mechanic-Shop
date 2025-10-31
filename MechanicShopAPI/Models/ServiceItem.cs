namespace MechanicShopAPI.Models;

/// <summary>
/// Service catalog item that customers can book
/// </summary>
public class ServiceItem
{
    public int Id { get; set; }

    // Multi-tenancy
    public int TenantId { get; set; }

    // Service Details
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public int DurationMinutes { get; set; } = 60; // Default 1 hour

    // Availability
    public bool IsActive { get; set; } = true;
    public bool IsBookableOnline { get; set; } = true;

    // Category
    public ServiceCategory Category { get; set; } = ServiceCategory.General;

    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Tenant Tenant { get; set; } = null!;
}

public enum ServiceCategory
{
    General = 0,
    OilChange = 1,
    BrakeService = 2,
    TireService = 3,
    Engine = 4,
    Transmission = 5,
    Electrical = 6,
    Diagnostic = 7,
    Inspection = 8,
    Maintenance = 9
}
