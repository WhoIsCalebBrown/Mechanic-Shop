using System;
using System.Collections.Generic;

namespace MechanicShopAPI;

public partial class Appointment
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int CustomerId { get; set; }

    public int VehicleId { get; set; }

    public int? AssignedStaffId { get; set; }

    public DateTime ScheduledDate { get; set; }

    public string ServiceType { get; set; } = null!;

    public string? Description { get; set; }

    public int Status { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual Staff? AssignedStaff { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<RepairOrder> RepairOrders { get; set; } = new List<RepairOrder>();

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;
}
