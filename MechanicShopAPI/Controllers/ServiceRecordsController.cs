using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.Models;

namespace MechanicShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceRecordsController : ControllerBase
{
    private readonly MechanicShopContext _context;

    public ServiceRecordsController(MechanicShopContext context)
    {
        _context = context;
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
    public async Task<ActionResult<ServiceRecord>> CreateServiceRecord(ServiceRecord serviceRecord)
    {
        serviceRecord.CreatedAt = DateTime.UtcNow;
        _context.ServiceRecords.Add(serviceRecord);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServiceRecord), new { id = serviceRecord.Id }, serviceRecord);
    }

    // PUT: api/servicerecords/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServiceRecord(int id, ServiceRecord serviceRecord)
    {
        if (id != serviceRecord.Id)
        {
            return BadRequest();
        }

        _context.Entry(serviceRecord).State = EntityState.Modified;

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
