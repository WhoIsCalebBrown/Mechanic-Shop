using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.Models;
using MechanicShopAPI.DTOs;
using MechanicShopAPI.Services;

namespace MechanicShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireStaff")] // Requires active staff member with tenant
public class VehiclesController : ControllerBase
{
    private readonly MechanicShopContext _context;
    private readonly ITenantAccessor _tenantAccessor;

    public VehiclesController(MechanicShopContext context, ITenantAccessor tenantAccessor)
    {
        _context = context;
        _tenantAccessor = tenantAccessor;
    }

    // GET: api/vehicles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
    {
        return await _context.Vehicles
            .Include(v => v.Customer)
            .Include(v => v.ServiceRecords)
            .ToListAsync();
    }

    // GET: api/vehicles/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Vehicle>> GetVehicle(int id)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.Customer)
            .Include(v => v.ServiceRecords)
            .Include(v => v.Appointments)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vehicle == null)
        {
            return NotFound();
        }

        return vehicle;
    }

    // GET: api/vehicles/customer/5
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehiclesByCustomer(int customerId)
    {
        return await _context.Vehicles
            .Where(v => v.CustomerId == customerId)
            .Include(v => v.ServiceRecords)
            .ToListAsync();
    }

    // POST: api/vehicles
    [HttpPost]
    public async Task<ActionResult<Vehicle>> CreateVehicle(CreateVehicleDto dto)
    {
        // Ensure tenant is resolved
        if (!_tenantAccessor.TenantId.HasValue)
        {
            return BadRequest(new { error = "Tenant context not found. Please ensure you're authenticated." });
        }

        var vehicle = new Vehicle
        {
            TenantId = _tenantAccessor.TenantId.Value,
            CustomerId = dto.CustomerId,
            Make = dto.Make,
            Model = dto.Model,
            Year = dto.Year,
            VIN = dto.VIN,
            LicensePlate = dto.LicensePlate,
            Color = dto.Color,
            Mileage = dto.Mileage,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        // Reload with customer data
        await _context.Entry(vehicle).Reference(v => v.Customer).LoadAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
    }

    // PUT: api/vehicles/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVehicle(int id, UpdateVehicleDto dto)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null)
        {
            return NotFound();
        }

        vehicle.CustomerId = dto.CustomerId;
        vehicle.Make = dto.Make;
        vehicle.Model = dto.Model;
        vehicle.Year = dto.Year;
        vehicle.VIN = dto.VIN;
        vehicle.LicensePlate = dto.LicensePlate;
        vehicle.Color = dto.Color;
        vehicle.Mileage = dto.Mileage;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!VehicleExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/vehicles/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null)
        {
            return NotFound();
        }

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool VehicleExists(int id)
    {
        return _context.Vehicles.Any(e => e.Id == id);
    }
}
