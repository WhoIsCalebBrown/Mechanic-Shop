using System;
using System.Collections.Generic;

namespace MechanicShopAPI;

public partial class ServiceRecord
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int VehicleId { get; set; }

    public int? RepairOrderId { get; set; }

    public int? PerformedByStaffId { get; set; }

    public DateTime ServiceDate { get; set; }

    public string ServiceType { get; set; } = null!;

    public string Description { get; set; } = null!;

    public decimal LaborCost { get; set; }

    public decimal PartsCost { get; set; }

    public int? MileageAtService { get; set; }

    public string? TechnicianName { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Staff? PerformedByStaff { get; set; }

    public virtual RepairOrder? RepairOrder { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;
}
