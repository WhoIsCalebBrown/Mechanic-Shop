using System;
using System.Collections.Generic;

namespace MechanicShopAPI;

public partial class Vehicle
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int CustomerId { get; set; }

    public string Make { get; set; } = null!;

    public string Model { get; set; } = null!;

    public int Year { get; set; }

    public string? Vin { get; set; }

    public string? LicensePlate { get; set; }

    public string? Color { get; set; }

    public int? Mileage { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<RepairOrder> RepairOrders { get; set; } = new List<RepairOrder>();

    public virtual ICollection<ServiceRecord> ServiceRecords { get; set; } = new List<ServiceRecord>();

    public virtual Tenant Tenant { get; set; } = null!;
}
