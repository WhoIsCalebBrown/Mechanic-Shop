namespace MechanicShopAPI.Models;

/// <summary>
/// RepairOrder represents a work order for repairs/service on a vehicle
/// </summary>
public class RepairOrder
{
    public int Id { get; set; }

    // Multi-tenancy
    public int TenantId { get; set; }

    // Relationships
    public int VehicleId { get; set; }
    public int CustomerId { get; set; }
    public int? AppointmentId { get; set; } // Link to originating appointment
    public int? AssignedTechnicianId { get; set; } // Assigned staff member

    // Order Details
    public string OrderNumber { get; set; } = string.Empty; // e.g., "RO-2025-001"
    public string Description { get; set; } = string.Empty;
    public RepairOrderStatus Status { get; set; } = RepairOrderStatus.Pending;
    public RepairOrderPriority Priority { get; set; } = RepairOrderPriority.Normal;

    // Timeline
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ScheduledStartDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? EstimatedCompletionDate { get; set; }
    public DateTime? ActualCompletionDate { get; set; }

    // Cost Estimates & Actuals
    public decimal EstimatedLaborCost { get; set; }
    public decimal EstimatedPartsCost { get; set; }
    public decimal ActualLaborCost { get; set; }
    public decimal ActualPartsCost { get; set; }

    // Computed properties
    public decimal EstimatedTotalCost => EstimatedLaborCost + EstimatedPartsCost;
    public decimal ActualTotalCost => ActualLaborCost + ActualPartsCost;

    // Additional Details
    public decimal? EstimatedLaborHours { get; set; }
    public decimal? ActualLaborHours { get; set; }
    public int? MileageIn { get; set; }
    public int? MileageOut { get; set; }
    public string? CustomerNotes { get; set; }
    public string? TechnicianNotes { get; set; }
    public string? InternalNotes { get; set; }

    // Authorization & Approval
    public bool CustomerApproved { get; set; }
    public DateTime? CustomerApprovedAt { get; set; }
    public string? CustomerSignature { get; set; } // Base64 or URL

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Vehicle Vehicle { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Appointment? Appointment { get; set; }
    public Staff? AssignedTechnician { get; set; }
    public ICollection<ServiceRecord> ServiceRecords { get; set; } = new List<ServiceRecord>();
}

public enum RepairOrderStatus
{
    Pending = 0,           // Created but not started
    Approved = 1,          // Customer approved estimate
    InProgress = 2,        // Work in progress
    AwaitingParts = 3,     // Waiting for parts
    AwaitingApproval = 4,  // Waiting for customer approval
    Completed = 5,         // Work completed
    Invoiced = 6,          // Invoice generated
    Paid = 7,              // Payment received
    Cancelled = 8          // Order cancelled
}

public enum RepairOrderPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}
