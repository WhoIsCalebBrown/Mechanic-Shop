namespace MechanicShopAPI.Models;

public class Tenant
{
    public int Id { get; set; }

    // Tenant Identification
    public string Slug { get; set; } = string.Empty; // URL-safe identifier (e.g., "precision-auto")
    public string Name { get; set; } = string.Empty; // Business name

    // Business Profile
    public string? BusinessAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; } = "US";
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? Description { get; set; }

    // Timezone for scheduling (IANA timezone ID, e.g., "America/New_York", "America/Los_Angeles")
    public string TimeZone { get; set; } = "America/New_York"; // Default to EST

    // Subscription & Plan
    public TenantPlan Plan { get; set; } = TenantPlan.Basic;
    public TenantStatus Status { get; set; } = TenantStatus.Active;
    public DateTime? TrialEndsAt { get; set; }
    public DateTime? SubscriptionEndsAt { get; set; }

    // Onboarding
    public bool OnboardingCompleted { get; set; } = false;
    public DateTime? OnboardingCompletedAt { get; set; }
    public int OnboardingStep { get; set; } = 0; // Track current step in wizard

    // Availability & Booking
    public string? AvailabilityRules { get; set; } // JSON: Stored as AvailabilityRules model
    public bool BookingEnabled { get; set; } = false; // Enable/disable public booking

    // Integration Settings (stored as JSON in PostgreSQL)
    public string? IntegrationSettings { get; set; } // JSON: { "stripe": {...}, "twilio": {...}, etc. }

    // Storage & Media
    public string? MediaStoragePath { get; set; } // e.g., "/tenants/{slug}/media"
    public long StorageUsedBytes { get; set; } = 0;
    public long StorageLimitBytes { get; set; } = 5_368_709_120; // 5GB default

    // Limits by Plan
    public int MaxUsers { get; set; } = 5;
    public int MaxCustomers { get; set; } = 100;
    public int MaxVehicles { get; set; } = 200;

    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }

    // Navigation Properties (Tenant-scoped entities)
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<ServiceRecord> ServiceRecords { get; set; } = new List<ServiceRecord>();
    public ICollection<Staff> Staff { get; set; } = new List<Staff>();
    public ICollection<RepairOrder> RepairOrders { get; set; } = new List<RepairOrder>();
    public ICollection<ServiceItem> ServiceItems { get; set; } = new List<ServiceItem>();
}

public enum TenantPlan
{
    Free = 0,
    Basic = 1,
    Professional = 2,
    Enterprise = 3
}

public enum TenantStatus
{
    Active = 0,
    Trial = 1,
    Suspended = 2,
    Cancelled = 3,
    Expired = 4
}
