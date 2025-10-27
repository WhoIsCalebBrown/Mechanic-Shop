using MechanicShopAPI.Models;

namespace MechanicShopAPI.DTOs;

public class CreateAppointmentDto
{
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string? Notes { get; set; }
}

public class UpdateAppointmentDto
{
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AppointmentStatus Status { get; set; }
    public string? Notes { get; set; }
}
