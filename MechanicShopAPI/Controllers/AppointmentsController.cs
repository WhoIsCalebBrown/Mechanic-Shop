using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.Models;
using MechanicShopAPI.DTOs;

namespace MechanicShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly MechanicShopContext _context;

    public AppointmentsController(MechanicShopContext context)
    {
        _context = context;
    }

    // GET: api/appointments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .OrderBy(a => a.ScheduledDate)
            .ToListAsync();
    }

    // GET: api/appointments/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Appointment>> GetAppointment(int id)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return NotFound();
        }

        return appointment;
    }

    // GET: api/appointments/upcoming
    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<Appointment>>> GetUpcomingAppointments()
    {
        return await _context.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .Where(a => a.ScheduledDate >= DateTime.UtcNow && a.Status == AppointmentStatus.Scheduled)
            .OrderBy(a => a.ScheduledDate)
            .ToListAsync();
    }

    // GET: api/appointments/customer/5
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByCustomer(int customerId)
    {
        return await _context.Appointments
            .Include(a => a.Vehicle)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.ScheduledDate)
            .ToListAsync();
    }

    // POST: api/appointments
    [HttpPost]
    public async Task<ActionResult<Appointment>> CreateAppointment(CreateAppointmentDto dto)
    {
        var appointment = new Appointment
        {
            CustomerId = dto.CustomerId,
            VehicleId = dto.VehicleId,
            ScheduledDate = dto.ScheduledDate,
            ServiceType = dto.ServiceType,
            Description = dto.Description,
            Status = dto.Status,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        await _context.Entry(appointment).Reference(a => a.Customer).LoadAsync();
        await _context.Entry(appointment).Reference(a => a.Vehicle).LoadAsync();

        return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
    }

    // PUT: api/appointments/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppointment(int id, UpdateAppointmentDto dto)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
        {
            return NotFound();
        }

        appointment.CustomerId = dto.CustomerId;
        appointment.VehicleId = dto.VehicleId;
        appointment.ScheduledDate = dto.ScheduledDate;
        appointment.ServiceType = dto.ServiceType;
        appointment.Description = dto.Description;
        appointment.Status = dto.Status;
        appointment.Notes = dto.Notes;

        if (dto.Status == AppointmentStatus.Completed && appointment.CompletedAt == null)
        {
            appointment.CompletedAt = DateTime.UtcNow;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AppointmentExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // PATCH: api/appointments/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] AppointmentStatus status)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
        {
            return NotFound();
        }

        appointment.Status = status;
        if (status == AppointmentStatus.Completed)
        {
            appointment.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/appointments/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
        {
            return NotFound();
        }

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool AppointmentExists(int id)
    {
        return _context.Appointments.Any(e => e.Id == id);
    }
}
