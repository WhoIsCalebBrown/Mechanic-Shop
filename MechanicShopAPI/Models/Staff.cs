namespace MechanicShopAPI.Models;

public class Staff
{
    public int Id { get; set; }

    // Multi-tenancy
    public int TenantId { get; set; }

    // User Identity (if using authentication system)
    public string? UserId { get; set; } // External auth system user ID

    // Personal Information
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    // Role & Status
    public StaffRole Role { get; set; } = StaffRole.Technician;
    public StaffStatus Status { get; set; } = StaffStatus.Active;

    // Employment Details
    public DateTime HireDate { get; set; } = DateTime.UtcNow;
    public DateTime? TerminationDate { get; set; }
    public decimal? HourlyRate { get; set; }

    // Specializations & Skills
    public string? Specializations { get; set; } // Comma-separated or JSON
    public string? CertificationNumbers { get; set; } // e.g., ASE certifications
    public string? Notes { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Computed property
    public string FullName => $"{FirstName} {LastName}";

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Appointment> AssignedAppointments { get; set; } = new List<Appointment>();
    public ICollection<RepairOrder> AssignedRepairOrders { get; set; } = new List<RepairOrder>();
}

public enum StaffRole
{
    Owner = 0,       // Full access, manages business
    Manager = 1,     // Manages staff and operations
    Dispatcher = 2,  // Schedules appointments, manages workflow
    Technician = 3,  // Performs repairs, assigned to work orders
    Advisor = 4      // Service advisor, customer-facing
}

public enum StaffStatus
{
    Active = 0,
    OnLeave = 1,
    Suspended = 2,
    Terminated = 3
}
