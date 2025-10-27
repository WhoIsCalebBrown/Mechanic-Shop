namespace MechanicShopAPI.DTOs;

public class CreateServiceRecordDto
{
    public int VehicleId { get; set; }
    public DateTime ServiceDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal LaborCost { get; set; }
    public decimal PartsCost { get; set; }
    public int? MileageAtService { get; set; }
    public string? TechnicianName { get; set; }
    public string? Notes { get; set; }
}

public class UpdateServiceRecordDto
{
    public int VehicleId { get; set; }
    public DateTime ServiceDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal LaborCost { get; set; }
    public decimal PartsCost { get; set; }
    public int? MileageAtService { get; set; }
    public string? TechnicianName { get; set; }
    public string? Notes { get; set; }
}
