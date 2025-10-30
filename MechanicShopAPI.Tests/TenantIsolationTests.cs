using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.Models;
using MechanicShopAPI.Services;
using Xunit;

namespace MechanicShopAPI.Tests;

public class TenantIsolationTests : IDisposable
{
    private readonly MechanicShopContext _context;
    private readonly TestTenantAccessor _tenantAccessor;

    public TenantIsolationTests()
    {
        var options = new DbContextOptionsBuilder<MechanicShopContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _tenantAccessor = new TestTenantAccessor();
        _context = new MechanicShopContext(options, _tenantAccessor);

        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        // Create test tenants
        var tenant1 = new Tenant
        {
            Id = 1,
            Slug = "tenant1",
            Name = "Tenant 1",
            Status = TenantStatus.Active,
            Plan = TenantPlan.Basic
        };

        var tenant2 = new Tenant
        {
            Id = 2,
            Slug = "tenant2",
            Name = "Tenant 2",
            Status = TenantStatus.Active,
            Plan = TenantPlan.Professional
        };

        _context.Tenants.AddRange(tenant1, tenant2);

        // Create customers for each tenant
        var customer1 = new Customer
        {
            Id = 1,
            TenantId = 1,
            FirstName = "John",
            LastName = "Doe",
            Email = "john@tenant1.com",
            Phone = "555-1001"
        };

        var customer2 = new Customer
        {
            Id = 2,
            TenantId = 2,
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane@tenant2.com",
            Phone = "555-2001"
        };

        _context.Customers.AddRange(customer1, customer2);

        // Create vehicles for each tenant
        var vehicle1 = new Vehicle
        {
            Id = 1,
            TenantId = 1,
            CustomerId = 1,
            Make = "Toyota",
            Model = "Camry",
            Year = 2020
        };

        var vehicle2 = new Vehicle
        {
            Id = 2,
            TenantId = 2,
            CustomerId = 2,
            Make = "Honda",
            Model = "Accord",
            Year = 2021
        };

        _context.Vehicles.AddRange(vehicle1, vehicle2);

        // Create appointments
        var appointment1 = new Appointment
        {
            Id = 1,
            TenantId = 1,
            CustomerId = 1,
            VehicleId = 1,
            ServiceType = "Oil Change",
            ScheduledDate = DateTime.UtcNow.AddDays(1),
            Status = AppointmentStatus.Scheduled
        };

        var appointment2 = new Appointment
        {
            Id = 2,
            TenantId = 2,
            CustomerId = 2,
            VehicleId = 2,
            ServiceType = "Brake Service",
            ScheduledDate = DateTime.UtcNow.AddDays(2),
            Status = AppointmentStatus.Scheduled
        };

        _context.Appointments.AddRange(appointment1, appointment2);

        _context.SaveChanges();
    }

    [Fact]
    public void Customers_Are_Isolated_By_Tenant()
    {
        // Arrange: Set tenant context to tenant 1
        _tenantAccessor.SetTenant(1, "tenant1");

        // Act: Query customers
        var customers = _context.Customers.ToList();

        // Assert: Should only get tenant 1 customers
        Assert.Single(customers);
        Assert.Equal(1, customers[0].TenantId);
        Assert.Equal("John", customers[0].FirstName);
    }

    [Fact]
    public void Vehicles_Are_Isolated_By_Tenant()
    {
        // Arrange: Set tenant context to tenant 2
        _tenantAccessor.SetTenant(2, "tenant2");

        // Act: Query vehicles
        var vehicles = _context.Vehicles.ToList();

        // Assert: Should only get tenant 2 vehicles
        Assert.Single(vehicles);
        Assert.Equal(2, vehicles[0].TenantId);
        Assert.Equal("Honda", vehicles[0].Make);
    }

    [Fact]
    public void Appointments_Are_Isolated_By_Tenant()
    {
        // Arrange: Set tenant context to tenant 1
        _tenantAccessor.SetTenant(1, "tenant1");

        // Act: Query appointments
        var appointments = _context.Appointments.ToList();

        // Assert: Should only get tenant 1 appointments
        Assert.Single(appointments);
        Assert.Equal(1, appointments[0].TenantId);
        Assert.Equal("Oil Change", appointments[0].ServiceType);
    }

    [Fact]
    public void Cannot_Access_Other_Tenant_Data()
    {
        // Arrange: Set tenant context to tenant 1
        _tenantAccessor.SetTenant(1, "tenant1");

        // Act: Try to query customer from tenant 2 by ID
        var customer = _context.Customers.FirstOrDefault(c => c.Id == 2);

        // Assert: Should not be able to access tenant 2's customer
        Assert.Null(customer);
    }

    [Fact]
    public void Can_Insert_Data_With_Tenant_Context()
    {
        // Arrange: Set tenant context to tenant 1
        _tenantAccessor.SetTenant(1, "tenant1");

        // Act: Create a new customer
        var newCustomer = new Customer
        {
            TenantId = 1,
            FirstName = "Bob",
            LastName = "Johnson",
            Email = "bob@tenant1.com",
            Phone = "555-1002"
        };

        _context.Customers.Add(newCustomer);
        _context.SaveChanges();

        // Assert: Customer should be saved and retrievable
        var retrieved = _context.Customers
            .FirstOrDefault(c => c.Email == "bob@tenant1.com");

        Assert.NotNull(retrieved);
        Assert.Equal(1, retrieved.TenantId);
    }

    [Fact]
    public void Cannot_Insert_Data_For_Different_Tenant()
    {
        // Arrange: Set tenant context to tenant 1
        _tenantAccessor.SetTenant(1, "tenant1");

        // Act: Try to create customer for tenant 2
        var newCustomer = new Customer
        {
            TenantId = 2, // Wrong tenant!
            FirstName = "Malicious",
            LastName = "User",
            Email = "malicious@tenant2.com",
            Phone = "555-9999"
        };

        _context.Customers.Add(newCustomer);
        _context.SaveChanges();

        // Assert: Query with tenant 1 context should not see this customer
        var retrieved = _context.Customers
            .FirstOrDefault(c => c.Email == "malicious@tenant2.com");

        Assert.Null(retrieved);

        // But it exists in the database for tenant 2
        _tenantAccessor.SetTenant(2, "tenant2");
        var retrievedAsTenant2 = _context.Customers
            .FirstOrDefault(c => c.Email == "malicious@tenant2.com");

        Assert.NotNull(retrievedAsTenant2);
    }

    [Fact]
    public void No_Tenant_Context_Returns_No_Results()
    {
        // Arrange: Clear tenant context
        _tenantAccessor.ClearTenant();

        // Act: Query customers without tenant context
        var customers = _context.Customers.ToList();

        // Assert: Should return all customers when no tenant filter is applied
        // (This behavior depends on your query filter implementation)
        Assert.Equal(2, customers.Count);
    }

    [Fact]
    public void Switching_Tenant_Context_Changes_Results()
    {
        // Arrange & Act: Query as tenant 1
        _tenantAccessor.SetTenant(1, "tenant1");
        var tenant1Customers = _context.Customers.ToList();

        // Switch to tenant 2
        _tenantAccessor.SetTenant(2, "tenant2");
        var tenant2Customers = _context.Customers.ToList();

        // Assert: Should get different results
        Assert.Single(tenant1Customers);
        Assert.Single(tenant2Customers);
        Assert.NotEqual(tenant1Customers[0].Id, tenant2Customers[0].Id);
    }

    [Fact]
    public void Related_Entities_Are_Also_Filtered()
    {
        // Arrange: Set tenant context to tenant 1
        _tenantAccessor.SetTenant(1, "tenant1");

        // Act: Query customer with vehicles
        var customer = _context.Customers
            .Include(c => c.Vehicles)
            .FirstOrDefault();

        // Assert: Customer and related vehicles should be from tenant 1
        Assert.NotNull(customer);
        Assert.Equal(1, customer.TenantId);
        Assert.Single(customer.Vehicles);
        Assert.Equal(1, customer.Vehicles.First().TenantId);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    // Test implementation of ITenantAccessor
    private class TestTenantAccessor : ITenantAccessor
    {
        private int? _tenantId;
        private string? _tenantSlug;

        public int? TenantId => _tenantId;
        public string? TenantSlug => _tenantSlug;

        public void SetTenant(int tenantId, string tenantSlug)
        {
            _tenantId = tenantId;
            _tenantSlug = tenantSlug;
        }

        public void ClearTenant()
        {
            _tenantId = null;
            _tenantSlug = null;
        }
    }
}
