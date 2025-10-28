using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Models;

namespace MechanicShopAPI.Data;

public class MechanicShopContext : DbContext
{
    public MechanicShopContext(DbContextOptions<MechanicShopContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Vehicle> Vehicles { get; set; } = null!;
    public DbSet<Appointment> Appointments { get; set; } = null!;
    public DbSet<ServiceRecord> ServiceRecords { get; set; } = null!;
    public DbSet<SiteSettings> SiteSettings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Customer
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Email);
        });

        // Configure Vehicle
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Make).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Model).IsRequired().HasMaxLength(50);
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Vehicles)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Appointment
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(100);
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Appointments)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Vehicle)
                .WithMany(v => v.Appointments)
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure ServiceRecord
        modelBuilder.Entity<ServiceRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LaborCost).HasPrecision(10, 2);
            entity.Property(e => e.PartsCost).HasPrecision(10, 2);
            entity.Ignore(e => e.TotalCost); // Computed property
            entity.HasOne(e => e.Vehicle)
                .WithMany(v => v.ServiceRecords)
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure SiteSettings
        modelBuilder.Entity<SiteSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BusinessName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
        });
    }
}
