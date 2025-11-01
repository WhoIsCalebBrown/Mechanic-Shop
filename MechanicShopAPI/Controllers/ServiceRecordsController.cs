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
[Authorize(Policy = "RequireTechnician")] // Requires technician role or higher
public class ServiceRecordsController : ControllerBase
{
    private readonly MechanicShopContext _context;
    private readonly ITenantAccessor _tenantAccessor;

    public ServiceRecordsController(MechanicShopContext context, ITenantAccessor tenantAccessor)
    {
        _context = context;
        _tenantAccessor = tenantAccessor;
    }

    // GET: api/servicerecords
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceRecord>>> GetServiceRecords()
    {
        return await _context.ServiceRecords
            .Include(s => s.Vehicle)
                .ThenInclude(v => v.Customer)
            .OrderByDescending(s => s.ServiceDate)
            .ToListAsync();
    }

    // GET: api/servicerecords/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceRecord>> GetServiceRecord(int id)
    {
        var serviceRecord = await _context.ServiceRecords
            .Include(s => s.Vehicle)
                .ThenInclude(v => v.Customer)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (serviceRecord == null)
        {
            return NotFound();
        }

        return serviceRecord;
    }

    // GET: api/servicerecords/vehicle/5
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<ServiceRecord>>> GetServiceRecordsByVehicle(int vehicleId)
    {
        return await _context.ServiceRecords
            .Where(s => s.VehicleId == vehicleId)
            .OrderByDescending(s => s.ServiceDate)
            .ToListAsync();
    }

    // POST: api/servicerecords
    [HttpPost]
    public async Task<ActionResult<ServiceRecord>> CreateServiceRecord(CreateServiceRecordDto dto)
    {
        // Ensure tenant is resolved
        if (!_tenantAccessor.TenantId.HasValue)
        {
            return BadRequest(new { error = "Tenant context not found. Please ensure you're authenticated." });
        }

        var serviceRecord = new ServiceRecord
        {
            TenantId = _tenantAccessor.TenantId.Value,
            VehicleId = dto.VehicleId,
            ServiceDate = dto.ServiceDate,
            ServiceType = dto.ServiceType,
            Description = dto.Description,
            LaborCost = dto.LaborCost,
            PartsCost = dto.PartsCost,
            MileageAtService = dto.MileageAtService,
            TechnicianName = dto.TechnicianName,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.ServiceRecords.Add(serviceRecord);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        await _context.Entry(serviceRecord).Reference(s => s.Vehicle).LoadAsync();

        return CreatedAtAction(nameof(GetServiceRecord), new { id = serviceRecord.Id }, serviceRecord);
    }

    // PUT: api/servicerecords/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServiceRecord(int id, UpdateServiceRecordDto dto)
    {
        var serviceRecord = await _context.ServiceRecords.FindAsync(id);
        if (serviceRecord == null)
        {
            return NotFound();
        }

        serviceRecord.VehicleId = dto.VehicleId;
        serviceRecord.ServiceDate = dto.ServiceDate;
        serviceRecord.ServiceType = dto.ServiceType;
        serviceRecord.Description = dto.Description;
        serviceRecord.LaborCost = dto.LaborCost;
        serviceRecord.PartsCost = dto.PartsCost;
        serviceRecord.MileageAtService = dto.MileageAtService;
        serviceRecord.TechnicianName = dto.TechnicianName;
        serviceRecord.Notes = dto.Notes;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ServiceRecordExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/servicerecords/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServiceRecord(int id)
    {
        var serviceRecord = await _context.ServiceRecords.FindAsync(id);
        if (serviceRecord == null)
        {
            return NotFound();
        }

        _context.ServiceRecords.Remove(serviceRecord);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ServiceRecordExists(int id)
    {
        return _context.ServiceRecords.Any(e => e.Id == id);
    }
}
