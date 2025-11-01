using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MechanicShopAPI;

public partial class MechanicshopDevContext : DbContext
{
    public MechanicshopDevContext()
    {
    }

    public MechanicshopDevContext(DbContextOptions<MechanicshopDevContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<AspNetRole> AspNetRoles { get; set; }

    public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; }

    public virtual DbSet<AspNetUser> AspNetUsers { get; set; }

    public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }

    public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }

    public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<RepairOrder> RepairOrders { get; set; }

    public virtual DbSet<ServiceItem> ServiceItems { get; set; }

    public virtual DbSet<ServiceRecord> ServiceRecords { get; set; }

    public virtual DbSet<SiteSetting> SiteSettings { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<Tenant> Tenants { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql("Name=ConnectionStrings:DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasIndex(e => e.AssignedStaffId, "IX_Appointments_AssignedStaffId");

            entity.HasIndex(e => e.CustomerId, "IX_Appointments_CustomerId");

            entity.HasIndex(e => e.TenantId, "IX_Appointments_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.ScheduledDate }, "IX_Appointments_TenantId_ScheduledDate");

            entity.HasIndex(e => new { e.TenantId, e.Status }, "IX_Appointments_TenantId_Status");

            entity.HasIndex(e => e.VehicleId, "IX_Appointments_VehicleId");

            entity.Property(e => e.ServiceType).HasMaxLength(100);

            entity.HasOne(d => d.AssignedStaff).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.AssignedStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(d => d.Customer).WithMany(p => p.Appointments).HasForeignKey(d => d.CustomerId);

            entity.HasOne(d => d.Tenant).WithMany(p => p.Appointments).HasForeignKey(d => d.TenantId);

            entity.HasOne(d => d.Vehicle).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AspNetRole>(entity =>
        {
            entity.HasIndex(e => e.NormalizedName, "RoleNameIndex").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.NormalizedName).HasMaxLength(256);
        });

        modelBuilder.Entity<AspNetRoleClaim>(entity =>
        {
            entity.HasIndex(e => e.RoleId, "IX_AspNetRoleClaims_RoleId");

            entity.HasOne(d => d.Role).WithMany(p => p.AspNetRoleClaims).HasForeignKey(d => d.RoleId);
        });

        modelBuilder.Entity<AspNetUser>(entity =>
        {
            entity.HasIndex(e => e.NormalizedEmail, "EmailIndex");

            entity.HasIndex(e => e.StaffId, "IX_AspNetUsers_StaffId");

            entity.HasIndex(e => e.NormalizedUserName, "UserNameIndex").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
            entity.Property(e => e.UserName).HasMaxLength(256);

            entity.HasOne(d => d.Staff).WithMany(p => p.AspNetUsers)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "AspNetUserRole",
                    r => r.HasOne<AspNetRole>().WithMany().HasForeignKey("RoleId"),
                    l => l.HasOne<AspNetUser>().WithMany().HasForeignKey("UserId"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("AspNetUserRoles");
                        j.HasIndex(new[] { "RoleId" }, "IX_AspNetUserRoles_RoleId");
                    });
        });

        modelBuilder.Entity<AspNetUserClaim>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_AspNetUserClaims_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserClaims).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserLogin>(entity =>
        {
            entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });

            entity.HasIndex(e => e.UserId, "IX_AspNetUserLogins_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserLogins).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserToken>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserTokens).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(e => e.TenantId, "IX_Customers_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.Email }, "IX_Customers_TenantId_Email").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);

            entity.HasOne(d => d.Tenant).WithMany(p => p.Customers).HasForeignKey(d => d.TenantId);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(e => e.Token, "IX_RefreshTokens_Token");

            entity.HasIndex(e => e.UserId, "IX_RefreshTokens_UserId");

            entity.HasIndex(e => new { e.UserId, e.IsRevoked }, "IX_RefreshTokens_UserId_IsRevoked");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Token).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<RepairOrder>(entity =>
        {
            entity.HasIndex(e => e.AppointmentId, "IX_RepairOrders_AppointmentId");

            entity.HasIndex(e => e.AssignedTechnicianId, "IX_RepairOrders_AssignedTechnicianId");

            entity.HasIndex(e => e.CustomerId, "IX_RepairOrders_CustomerId");

            entity.HasIndex(e => e.TenantId, "IX_RepairOrders_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.OrderNumber }, "IX_RepairOrders_TenantId_OrderNumber").IsUnique();

            entity.HasIndex(e => new { e.TenantId, e.Status }, "IX_RepairOrders_TenantId_Status");

            entity.HasIndex(e => e.VehicleId, "IX_RepairOrders_VehicleId");

            entity.Property(e => e.ActualLaborCost).HasPrecision(10, 2);
            entity.Property(e => e.ActualPartsCost).HasPrecision(10, 2);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.EstimatedLaborCost).HasPrecision(10, 2);
            entity.Property(e => e.EstimatedPartsCost).HasPrecision(10, 2);
            entity.Property(e => e.OrderNumber).HasMaxLength(50);

            entity.HasOne(d => d.Appointment).WithMany(p => p.RepairOrders)
                .HasForeignKey(d => d.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(d => d.AssignedTechnician).WithMany(p => p.RepairOrders)
                .HasForeignKey(d => d.AssignedTechnicianId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(d => d.Customer).WithMany(p => p.RepairOrders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Tenant).WithMany(p => p.RepairOrders).HasForeignKey(d => d.TenantId);

            entity.HasOne(d => d.Vehicle).WithMany(p => p.RepairOrders)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ServiceItem>(entity =>
        {
            entity.HasIndex(e => e.TenantId, "IX_ServiceItems_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.IsActive }, "IX_ServiceItems_TenantId_IsActive");

            entity.HasIndex(e => new { e.TenantId, e.IsBookableOnline }, "IX_ServiceItems_TenantId_IsBookableOnline");

            entity.Property(e => e.BasePrice).HasPrecision(10, 2);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Name).HasMaxLength(100);

            entity.HasOne(d => d.Tenant).WithMany(p => p.ServiceItems).HasForeignKey(d => d.TenantId);
        });

        modelBuilder.Entity<ServiceRecord>(entity =>
        {
            entity.HasIndex(e => e.PerformedByStaffId, "IX_ServiceRecords_PerformedByStaffId");

            entity.HasIndex(e => e.RepairOrderId, "IX_ServiceRecords_RepairOrderId");

            entity.HasIndex(e => e.TenantId, "IX_ServiceRecords_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.ServiceDate }, "IX_ServiceRecords_TenantId_ServiceDate");

            entity.HasIndex(e => e.VehicleId, "IX_ServiceRecords_VehicleId");

            entity.Property(e => e.LaborCost).HasPrecision(10, 2);
            entity.Property(e => e.PartsCost).HasPrecision(10, 2);
            entity.Property(e => e.ServiceType).HasMaxLength(100);

            entity.HasOne(d => d.PerformedByStaff).WithMany(p => p.ServiceRecords)
                .HasForeignKey(d => d.PerformedByStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(d => d.RepairOrder).WithMany(p => p.ServiceRecords)
                .HasForeignKey(d => d.RepairOrderId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(d => d.Tenant).WithMany(p => p.ServiceRecords).HasForeignKey(d => d.TenantId);

            entity.HasOne(d => d.Vehicle).WithMany(p => p.ServiceRecords).HasForeignKey(d => d.VehicleId);
        });

        modelBuilder.Entity<SiteSetting>(entity =>
        {
            entity.HasIndex(e => e.TenantId, "IX_SiteSettings_TenantId");

            entity.Property(e => e.BusinessName).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Tenant).WithMany(p => p.SiteSettings).HasForeignKey(d => d.TenantId);
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasIndex(e => e.TenantId, "IX_Staff_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.Email }, "IX_Staff_TenantId_Email").IsUnique();

            entity.HasIndex(e => new { e.TenantId, e.Role }, "IX_Staff_TenantId_Role");

            entity.HasIndex(e => new { e.TenantId, e.Status }, "IX_Staff_TenantId_Status");

            entity.HasIndex(e => e.UserId, "IX_Staff_UserId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);

            entity.HasOne(d => d.Tenant).WithMany(p => p.Staff)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasIndex(e => e.Plan, "IX_Tenants_Plan");

            entity.HasIndex(e => e.Slug, "IX_Tenants_Slug").IsUnique();

            entity.HasIndex(e => e.Status, "IX_Tenants_Status");

            entity.Property(e => e.BookingEnabled).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.OnboardingCompleted).HasDefaultValue(false);
            entity.Property(e => e.OnboardingStep).HasDefaultValue(0);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Slug).HasMaxLength(100);
            entity.Property(e => e.TimeZone).HasDefaultValueSql("''::text");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasIndex(e => e.CustomerId, "IX_Vehicles_CustomerId");

            entity.HasIndex(e => e.TenantId, "IX_Vehicles_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.CustomerId }, "IX_Vehicles_TenantId_CustomerId");

            entity.Property(e => e.Make).HasMaxLength(50);
            entity.Property(e => e.Model).HasMaxLength(50);
            entity.Property(e => e.Vin).HasColumnName("VIN");

            entity.HasOne(d => d.Customer).WithMany(p => p.Vehicles).HasForeignKey(d => d.CustomerId);

            entity.HasOne(d => d.Tenant).WithMany(p => p.Vehicles).HasForeignKey(d => d.TenantId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
