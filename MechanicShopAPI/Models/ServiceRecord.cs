namespace MechanicShopAPI.Models;

public class ServiceRecord
{
    public int Id { get; set; }

    // Multi-tenancy
    public int TenantId { get; set; }

    public int VehicleId { get; set; }
    public int? RepairOrderId { get; set; } // Link to repair order
    public int? PerformedByStaffId { get; set; } // Staff who performed the service
    public DateTime ServiceDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal LaborCost { get; set; }
    public decimal PartsCost { get; set; }
    public decimal TotalCost => LaborCost + PartsCost;
    public int? MileageAtService { get; set; }
    public string? TechnicianName { get; set; } // Legacy field, use PerformedByStaff instead
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Tenant Tenant { get; set; } = null!;
    public Vehicle Vehicle { get; set; } = null!;
    public RepairOrder? RepairOrder { get; set; }
    public Staff? PerformedByStaff { get; set; }
}
