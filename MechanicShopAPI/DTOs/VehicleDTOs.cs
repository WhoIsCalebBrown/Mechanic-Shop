namespace MechanicShopAPI.DTOs;

public class CreateVehicleDto
{
    public int CustomerId { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? VIN { get; set; }
    public string? LicensePlate { get; set; }
    public string? Color { get; set; }
    public int? Mileage { get; set; }
}

public class UpdateVehicleDto
{
    public int CustomerId { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? VIN { get; set; }
    public string? LicensePlate { get; set; }
    public string? Color { get; set; }
    public int? Mileage { get; set; }
}
