using System;
using System.Collections.Generic;

namespace MechanicShopAPI;

public partial class Tenant
{
    public int Id { get; set; }

    public string Slug { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? BusinessAddress { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? ZipCode { get; set; }

    public string? Country { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Website { get; set; }

    public string? LogoUrl { get; set; }

    public string? Description { get; set; }

    public int Plan { get; set; }

    public int Status { get; set; }

    public DateTime? TrialEndsAt { get; set; }

    public DateTime? SubscriptionEndsAt { get; set; }

    public string? IntegrationSettings { get; set; }

    public string? MediaStoragePath { get; set; }

    public long StorageUsedBytes { get; set; }

    public long StorageLimitBytes { get; set; }

    public int MaxUsers { get; set; }

    public int MaxCustomers { get; set; }

    public int MaxVehicles { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? AvailabilityRules { get; set; }

    public bool BookingEnabled { get; set; }

    public bool OnboardingCompleted { get; set; }

    public DateTime? OnboardingCompletedAt { get; set; }

    public int OnboardingStep { get; set; }

    public string TimeZone { get; set; } = null!;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<RepairOrder> RepairOrders { get; set; } = new List<RepairOrder>();

    public virtual ICollection<ServiceItem> ServiceItems { get; set; } = new List<ServiceItem>();

    public virtual ICollection<ServiceRecord> ServiceRecords { get; set; } = new List<ServiceRecord>();

    public virtual ICollection<SiteSetting> SiteSettings { get; set; } = new List<SiteSetting>();

    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
