using System;
using System.Collections.Generic;

namespace MechanicShopAPI;

public partial class RepairOrder
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int VehicleId { get; set; }

    public int CustomerId { get; set; }

    public int? AppointmentId { get; set; }

    public int? AssignedTechnicianId { get; set; }

    public string OrderNumber { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int Status { get; set; }

    public int Priority { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ScheduledStartDate { get; set; }

    public DateTime? ActualStartDate { get; set; }

    public DateTime? EstimatedCompletionDate { get; set; }

    public DateTime? ActualCompletionDate { get; set; }

    public decimal EstimatedLaborCost { get; set; }

    public decimal EstimatedPartsCost { get; set; }

    public decimal ActualLaborCost { get; set; }

    public decimal ActualPartsCost { get; set; }

    public decimal? EstimatedLaborHours { get; set; }

    public decimal? ActualLaborHours { get; set; }

    public int? MileageIn { get; set; }

    public int? MileageOut { get; set; }

    public string? CustomerNotes { get; set; }

    public string? TechnicianNotes { get; set; }

    public string? InternalNotes { get; set; }

    public bool CustomerApproved { get; set; }

    public DateTime? CustomerApprovedAt { get; set; }

    public string? CustomerSignature { get; set; }

    public virtual Appointment? Appointment { get; set; }

    public virtual Staff? AssignedTechnician { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<ServiceRecord> ServiceRecords { get; set; } = new List<ServiceRecord>();

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;
}
