namespace MechanicShopAPI.Models;

public class Appointment
{
    public int Id { get; set; }

    // Multi-tenancy
    public int TenantId { get; set; }

    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Vehicle Vehicle { get; set; } = null!;
}

public enum AppointmentStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled,
    NoShow
}
