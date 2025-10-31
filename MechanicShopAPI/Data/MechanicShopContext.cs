using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Models;
using MechanicShopAPI.Services;

namespace MechanicShopAPI.Data;

public class MechanicShopContext : IdentityDbContext<ApplicationUser>
{
    private readonly ITenantAccessor _tenantAccessor;

    public MechanicShopContext(
        DbContextOptions<MechanicShopContext> options,
        ITenantAccessor tenantAccessor)
        : base(options)
    {
        _tenantAccessor = tenantAccessor;
    }

    public DbSet<Tenant> Tenants { get; set; } = null!;
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Vehicle> Vehicles { get; set; } = null!;
    public DbSet<Appointment> Appointments { get; set; } = null!;
    public DbSet<ServiceRecord> ServiceRecords { get; set; } = null!;
    public DbSet<SiteSettings> SiteSettings { get; set; } = null!;
    public DbSet<Staff> Staff { get; set; } = null!;
    public DbSet<RepairOrder> RepairOrders { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<ServiceItem> ServiceItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Tenant
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Unique index on slug for fast lookups
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Plan);

            // Seed test tenants
            entity.HasData(
                new Tenant
                {
                    Id = 1,
                    Slug = "precision-auto",
                    Name = "Precision Automotive",
                    BusinessAddress = "123 Main Street",
                    City = "Springfield",
                    State = "IL",
                    ZipCode = "62701",
                    Country = "US",
                    Phone = "(555) 123-4567",
                    Email = "contact@precision-auto.com",
                    Plan = TenantPlan.Professional,
                    Status = TenantStatus.Active,
                    MediaStoragePath = "/tenants/precision-auto/media",
                    MaxUsers = 10,
                    MaxCustomers = 1000,
                    MaxVehicles = 2000,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Tenant
                {
                    Id = 2,
                    Slug = "acme-motors",
                    Name = "ACME Motors & Repair",
                    BusinessAddress = "456 Industrial Blvd",
                    City = "Chicago",
                    State = "IL",
                    ZipCode = "60601",
                    Country = "US",
                    Phone = "(555) 987-6543",
                    Email = "info@acme-motors.com",
                    Plan = TenantPlan.Basic,
                    Status = TenantStatus.Active,
                    MediaStoragePath = "/tenants/acme-motors/media",
                    MaxUsers = 5,
                    MaxCustomers = 500,
                    MaxVehicles = 1000,
                    CreatedAt = new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc)
                },
                new Tenant
                {
                    Id = 3,
                    Slug = "speedway-service",
                    Name = "Speedway Service Center",
                    BusinessAddress = "789 Speedway Drive",
                    City = "Indianapolis",
                    State = "IN",
                    ZipCode = "46204",
                    Country = "US",
                    Phone = "(555) 555-0123",
                    Email = "service@speedway.com",
                    Plan = TenantPlan.Enterprise,
                    Status = TenantStatus.Active,
                    MediaStoragePath = "/tenants/speedway-service/media",
                    MaxUsers = 50,
                    MaxCustomers = 10000,
                    MaxVehicles = 20000,
                    CreatedAt = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        });

        // Configure Customer
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Tenant relationship
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Customers)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique email per tenant
            entity.HasIndex(e => new { e.TenantId, e.Email }).IsUnique();
            entity.HasIndex(e => e.TenantId);

            // Global query filter for multi-tenancy
            entity.HasQueryFilter(e => _tenantAccessor.TenantId == null || e.TenantId == _tenantAccessor.TenantId);
        });

        // Configure Vehicle
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Make).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Model).IsRequired().HasMaxLength(50);

            // Tenant relationship
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Vehicles)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Vehicles)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.TenantId, e.CustomerId });

            // Global query filter for multi-tenancy
            entity.HasQueryFilter(e => _tenantAccessor.TenantId == null || e.TenantId == _tenantAccessor.TenantId);
        });

        // Configure Appointment
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(100);

            // Tenant relationship
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Appointments)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Appointments)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Vehicle)
                .WithMany(v => v.Appointments)
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.AssignedStaff)
                .WithMany(s => s.AssignedAppointments)
                .HasForeignKey(e => e.AssignedStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.TenantId, e.ScheduledDate });
            entity.HasIndex(e => new { e.TenantId, e.Status });
            entity.HasIndex(e => e.AssignedStaffId);

            // Global query filter for multi-tenancy
            entity.HasQueryFilter(e => _tenantAccessor.TenantId == null || e.TenantId == _tenantAccessor.TenantId);
        });

        // Configure ServiceRecord
        modelBuilder.Entity<ServiceRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LaborCost).HasPrecision(10, 2);
            entity.Property(e => e.PartsCost).HasPrecision(10, 2);
            entity.Ignore(e => e.TotalCost); // Computed property

            // Tenant relationship
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.ServiceRecords)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Vehicle)
                .WithMany(v => v.ServiceRecords)
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.RepairOrder)
                .WithMany(r => r.ServiceRecords)
                .HasForeignKey(e => e.RepairOrderId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.PerformedByStaff)
                .WithMany()
                .HasForeignKey(e => e.PerformedByStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.TenantId, e.ServiceDate });
            entity.HasIndex(e => e.RepairOrderId);
            entity.HasIndex(e => e.PerformedByStaffId);

            // Global query filter for multi-tenancy
            entity.HasQueryFilter(e => _tenantAccessor.TenantId == null || e.TenantId == _tenantAccessor.TenantId);
        });

        // Configure Staff
        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Tenant relationship
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Staff)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.TenantId, e.Email }).IsUnique();
            entity.HasIndex(e => new { e.TenantId, e.Role });
            entity.HasIndex(e => new { e.TenantId, e.Status });
            entity.HasIndex(e => e.UserId);

            // Global query filter for multi-tenancy
            entity.HasQueryFilter(e => _tenantAccessor.TenantId == null || e.TenantId == _tenantAccessor.TenantId);
        });

        // Configure RepairOrder
        modelBuilder.Entity<RepairOrder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.EstimatedLaborCost).HasPrecision(10, 2);
            entity.Property(e => e.EstimatedPartsCost).HasPrecision(10, 2);
            entity.Property(e => e.ActualLaborCost).HasPrecision(10, 2);
            entity.Property(e => e.ActualPartsCost).HasPrecision(10, 2);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Ignore(e => e.EstimatedTotalCost);
            entity.Ignore(e => e.ActualTotalCost);

            // Tenant relationship
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.RepairOrders)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Other relationships
            entity.HasOne(e => e.Vehicle)
                .WithMany()
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Appointment)
                .WithMany(a => a.RepairOrders)
                .HasForeignKey(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.AssignedTechnician)
                .WithMany(s => s.AssignedRepairOrders)
                .HasForeignKey(e => e.AssignedTechnicianId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.TenantId, e.OrderNumber }).IsUnique();
            entity.HasIndex(e => new { e.TenantId, e.Status });
            entity.HasIndex(e => e.AssignedTechnicianId);
            entity.HasIndex(e => e.VehicleId);
            entity.HasIndex(e => e.CustomerId);

            // Global query filter for multi-tenancy
            entity.HasQueryFilter(e => _tenantAccessor.TenantId == null || e.TenantId == _tenantAccessor.TenantId);
        });

        // Configure ApplicationUser
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.HasOne(e => e.Staff)
                .WithMany()
                .HasForeignKey(e => e.StaffId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.StaffId);
        });

        // Configure RefreshToken
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Token);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.IsRevoked });
        });

        // Configure ServiceItem
        modelBuilder.Entity<ServiceItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.BasePrice).HasPrecision(10, 2);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Tenant relationship
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.ServiceItems)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.TenantId, e.IsActive });
            entity.HasIndex(e => new { e.TenantId, e.IsBookableOnline });

            // Global query filter for multi-tenancy
            entity.HasQueryFilter(e => _tenantAccessor.TenantId == null || e.TenantId == _tenantAccessor.TenantId);
        });

        // Configure SiteSettings
        modelBuilder.Entity<SiteSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BusinessName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Seed default site settings
            entity.HasData(new SiteSettings
            {
                Id = 1,
                BusinessName = "Precision Automotive",
                Tagline = "Expert Service for Your Vehicle",
                Address = "123 Auto Street",
                City = "City",
                State = "State",
                ZipCode = "12345",
                Phone = "(555) 123-4567",
                Email = "info@mechanic.com",
                MondayFridayHours = "8am - 6pm",
                SaturdayHours = "9am - 4pm",
                SundayHours = "Closed",
                VehiclesServiced = 5000,
                SatisfactionRate = 98,
                YearsExperience = 25,
                HeroTitle = "PRECISION\nAUTOMOTIVE\nCARE",
                HeroSubtitle = "Expert Service for Your Vehicle",
                PrimaryCtaText = "Schedule Service",
                SecondaryCtaText = "Our Services",
                Service1Title = "Routine Maintenance",
                Service1Description = "Oil changes, filter replacements, fluid checks, and comprehensive inspections to keep your vehicle running smoothly.",
                Service1Feature1 = "Oil & Filter Change",
                Service1Feature2 = "Brake Inspection",
                Service1Feature3 = "Tire Rotation",
                Service1Feature4 = "Fluid Top-ups",
                Service2Title = "Diagnostics & Repair",
                Service2Description = "Advanced diagnostic tools and expert technicians to identify and resolve any mechanical or electrical issues.",
                Service2Feature1 = "Computer Diagnostics",
                Service2Feature2 = "Engine Repair",
                Service2Feature3 = "Transmission Service",
                Service2Feature4 = "Electrical Systems",
                Service3Title = "Performance Upgrades",
                Service3Description = "Enhance your vehicle's performance with professional tuning, upgrades, and custom modifications.",
                Service3Feature1 = "Engine Tuning",
                Service3Feature2 = "Suspension Upgrades",
                Service3Feature3 = "Exhaust Systems",
                Service3Feature4 = "Brake Upgrades",
                WhyFeature1Title = "Expert Technicians",
                WhyFeature1Description = "ASE-certified mechanics with decades of combined experience",
                WhyFeature2Title = "Quality Parts",
                WhyFeature2Description = "We use only OEM and premium aftermarket parts",
                WhyFeature3Title = "Transparent Pricing",
                WhyFeature3Description = "No hidden fees, detailed estimates before any work begins",
                WhyFeature4Title = "Warranty Coverage",
                WhyFeature4Description = "All services backed by our comprehensive warranty",
                CtaTitle = "Ready to Get Started?",
                CtaSubtitle = "Schedule your service appointment today",
                CtaButtonText = "Book Appointment",
                UpdatedAt = new DateTime(2025, 10, 30, 0, 0, 0, DateTimeKind.Utc)
            });
        });
    }
}
