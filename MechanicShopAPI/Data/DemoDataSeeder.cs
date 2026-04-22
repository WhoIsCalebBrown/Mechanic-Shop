using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Models;
using MechanicShopAPI.Services;

namespace MechanicShopAPI.Data;

public static class DemoDataSeeder
{
    private const string DemoTenantSlug = "precision-auto";
    private const string DemoUserEmail = "demo@precision-auto.com";
    private const string DemoUserPassword = "Demo123!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<MechanicShopContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DemoDataSeeder");

        var tenant = await EnsureTenantAsync(context);

        await EnsureSiteSettingsAsync(context);
        await EnsureTenantSettingsAsync(context, tenant);
        await EnsureServiceItemsAsync(context, tenant);
        await EnsureStaffAsync(context, userManager, tenant);
        await EnsureCustomersAsync(context, tenant);
        await EnsureVehiclesAsync(context, tenant);
        await EnsureAppointmentsAsync(context, tenant);
        await EnsureServiceRecordsAsync(context, tenant);

        logger.LogInformation("Demo showcase data ensured for tenant {TenantSlug}", tenant.Slug);
    }

    private static async Task<Tenant> EnsureTenantAsync(MechanicShopContext context)
    {
        var tenant = await context.Tenants.FirstOrDefaultAsync(t => t.Slug == DemoTenantSlug);
        if (tenant != null)
        {
            tenant.Name = "Precision Automotive";
            tenant.BusinessAddress = "123 Auto Street";
            tenant.City = "Charlotte";
            tenant.State = "NC";
            tenant.ZipCode = "28202";
            tenant.Country = "US";
            tenant.Phone = "(555) 123-4567";
            tenant.Email = "service@precision-auto.com";
            tenant.Website = "https://precision-auto.example";
            tenant.Description = "A polished, full-service independent shop for general repair, diagnostics, maintenance, and fleet work.";
            tenant.Timezone = "America/New_York";
            tenant.BrandingSettings = JsonSerializer.Serialize(new BrandingSettings
            {
                LogoUrl = null,
                PrimaryColor = "#0f172a",
                SecondaryColor = "#f97316"
            });
            tenant.AvailabilityRules = BuildAvailabilityRules();
            tenant.Plan = TenantPlan.Professional;
            tenant.Status = TenantStatus.Active;
            tenant.OnboardingCompleted = true;
            tenant.OnboardingCompletedAt = DateTime.UtcNow;
            tenant.OnboardingStep = 3;
            tenant.BookingEnabled = true;
            tenant.MediaStoragePath ??= $"/tenants/{tenant.Slug}/media";
            tenant.MaxUsers = 12;
            tenant.MaxCustomers = 1500;
            tenant.MaxVehicles = 2500;
            tenant.UpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return tenant;
        }

        tenant = new Tenant
        {
            Slug = DemoTenantSlug,
            Name = "Precision Automotive",
            BusinessAddress = "123 Auto Street",
            City = "Charlotte",
            State = "NC",
            ZipCode = "28202",
            Country = "US",
            Phone = "(555) 123-4567",
            Email = "service@precision-auto.com",
            Website = "https://precision-auto.example",
            Description = "A polished, full-service independent shop for general repair, diagnostics, maintenance, and fleet work.",
            Timezone = "America/New_York",
            BrandingSettings = JsonSerializer.Serialize(new BrandingSettings
            {
                LogoUrl = null,
                PrimaryColor = "#0f172a",
                SecondaryColor = "#f97316"
            }),
            AvailabilityRules = BuildAvailabilityRules(),
            Plan = TenantPlan.Professional,
            Status = TenantStatus.Active,
            OnboardingCompleted = true,
            OnboardingCompletedAt = DateTime.UtcNow,
            OnboardingStep = 3,
            BookingEnabled = true,
            MediaStoragePath = $"/tenants/{DemoTenantSlug}/media",
            MaxUsers = 12,
            MaxCustomers = 1500,
            MaxVehicles = 2500,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        context.Tenants.Add(tenant);
        await context.SaveChangesAsync();
        return tenant;
    }

    private static async Task EnsureSiteSettingsAsync(MechanicShopContext context)
    {
        var siteSettings = await context.SiteSettings.FirstOrDefaultAsync();
        if (siteSettings != null)
        {
            return;
        }

        context.SiteSettings.Add(new SiteSettings
        {
            BusinessName = "Precision Automotive",
            Tagline = "Straight answers, clean work, fast turnaround.",
            Address = "123 Auto Street",
            City = "Charlotte",
            State = "NC",
            ZipCode = "28202",
            Phone = "(555) 123-4567",
            Email = "service@precision-auto.com",
            MondayFridayHours = "8am - 6pm",
            SaturdayHours = "9am - 2pm",
            SundayHours = "Closed",
            VehiclesServiced = 8421,
            SatisfactionRate = 99,
            YearsExperience = 18,
            HeroTitle = "PRECISION\nAUTO\nSERVICE",
            HeroSubtitle = "Diagnostics, repairs, maintenance, and booking in one place.",
            PrimaryCtaText = "Book Service",
            SecondaryCtaText = "View Services",
            Service1Title = "Maintenance",
            Service1Description = "Oil changes, brakes, tires, inspections, and scheduled service done on time.",
            Service1Feature1 = "Oil & Filter Change",
            Service1Feature2 = "Brake Inspection",
            Service1Feature3 = "Tire Rotation",
            Service1Feature4 = "Factory Maintenance",
            Service2Title = "Diagnostics",
            Service2Description = "Fast fault finding with scan tools, test drives, and clear estimates.",
            Service2Feature1 = "Check Engine",
            Service2Feature2 = "Electrical Faults",
            Service2Feature3 = "AC and Heat",
            Service2Feature4 = "Driveability Issues",
            Service3Title = "Repairs",
            Service3Description = "Engine, suspension, steering, and cooling-system repairs with photo-ready before/after workflows.",
            Service3Feature1 = "Suspension Repair",
            Service3Feature2 = "Cooling System",
            Service3Feature3 = "Engine Work",
            Service3Feature4 = "Road Test Verification",
            WhyFeature1Title = "Transparent Estimates",
            WhyFeature1Description = "Customers see the work and the price before anything starts.",
            WhyFeature2Title = "Organized Workflow",
            WhyFeature2Description = "Appointments, repair orders, and service history stay in sync.",
            WhyFeature3Title = "Trusted Staff",
            WhyFeature3Description = "Each job is tied to a real advisor or technician.",
            WhyFeature4Title = "Booking Ready",
            WhyFeature4Description = "Public booking is enabled with actual availability and services.",
            CtaTitle = "Ready to Get Rolling?",
            CtaSubtitle = "Open the dashboard, bookings, and service history with live sample data.",
            CtaButtonText = "Start Booking",
            UpdatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();
    }

    private static async Task EnsureTenantSettingsAsync(MechanicShopContext context, Tenant tenant)
    {
        var notifications = await context.NotificationPreferences.FirstOrDefaultAsync(n => n.TenantId == tenant.Id);
        if (notifications == null)
        {
            context.NotificationPreferences.Add(new NotificationPreferences
            {
                TenantId = tenant.Id,
                NewBookingEmail = true,
                NewBookingSms = false,
                PaymentReceivedEmail = true,
                PaymentReceivedSms = false,
                AppointmentReminderEmail = true,
                AppointmentReminderSms = false,
                CancellationEmail = true,
                CancellationSms = false
            });
        }
        else
        {
            notifications.NewBookingEmail = true;
            notifications.NewBookingSms = false;
            notifications.PaymentReceivedEmail = true;
            notifications.PaymentReceivedSms = false;
            notifications.AppointmentReminderEmail = true;
            notifications.AppointmentReminderSms = false;
            notifications.CancellationEmail = true;
            notifications.CancellationSms = false;
            notifications.UpdatedAt = DateTime.UtcNow;
        }

        var holidayDate1 = DateTime.SpecifyKind(new DateTime(DateTime.UtcNow.Year, 7, 4), DateTimeKind.Utc);
        var holidayDate2 = DateTime.SpecifyKind(new DateTime(DateTime.UtcNow.Year, 12, 25), DateTimeKind.Utc);

        if (!await context.HolidayOverrides.AnyAsync(h => h.TenantId == tenant.Id))
        {
            context.HolidayOverrides.AddRange(
                new HolidayOverride
                {
                    TenantId = tenant.Id,
                    Date = holidayDate1,
                    Name = "Independence Day",
                    IsClosed = true
                },
                new HolidayOverride
                {
                    TenantId = tenant.Id,
                    Date = holidayDate2,
                    Name = "Christmas Day",
                    IsClosed = true
                });
        }

        await context.SaveChangesAsync();
    }

    private static async Task EnsureServiceItemsAsync(MechanicShopContext context, Tenant tenant)
    {
        if (await context.ServiceItems.AnyAsync(s => s.TenantId == tenant.Id))
        {
            return;
        }

        context.ServiceItems.AddRange(
            new ServiceItem
            {
                TenantId = tenant.Id,
                Name = "Full Synthetic Oil Change",
                Description = "Oil and filter service with fluid top-off and quick inspection.",
                BasePrice = 89.00m,
                DurationMinutes = 45,
                IsActive = true,
                IsBookableOnline = true,
                Category = ServiceCategory.OilChange
            },
            new ServiceItem
            {
                TenantId = tenant.Id,
                Name = "Brake Inspection",
                Description = "Pads, rotors, calipers, and brake fluid inspection with written findings.",
                BasePrice = 49.00m,
                DurationMinutes = 30,
                IsActive = true,
                IsBookableOnline = true,
                Category = ServiceCategory.BrakeService
            },
            new ServiceItem
            {
                TenantId = tenant.Id,
                Name = "Engine Diagnostics",
                Description = "Scan-tool diagnostics, code review, and test drive for intermittent issues.",
                BasePrice = 129.00m,
                DurationMinutes = 90,
                IsActive = true,
                IsBookableOnline = true,
                Category = ServiceCategory.Diagnostic
            },
            new ServiceItem
            {
                TenantId = tenant.Id,
                Name = "Tire Rotation and Balance",
                Description = "Rotation, balance check, and tire-pressure inspection.",
                BasePrice = 74.00m,
                DurationMinutes = 60,
                IsActive = true,
                IsBookableOnline = true,
                Category = ServiceCategory.TireService
            },
            new ServiceItem
            {
                TenantId = tenant.Id,
                Name = "Factory Maintenance Package",
                Description = "Scheduled maintenance based on mileage and OEM requirements.",
                BasePrice = 199.00m,
                DurationMinutes = 120,
                IsActive = true,
                IsBookableOnline = true,
                Category = ServiceCategory.Maintenance
            },
            new ServiceItem
            {
                TenantId = tenant.Id,
                Name = "AC Performance Check",
                Description = "Cabin air, refrigerant, compressor operation, and vent temperature test.",
                BasePrice = 109.00m,
                DurationMinutes = 60,
                IsActive = true,
                IsBookableOnline = true,
                Category = ServiceCategory.General
            });

        await context.SaveChangesAsync();
    }

    private static async Task EnsureStaffAsync(MechanicShopContext context, UserManager<ApplicationUser> userManager, Tenant tenant)
    {
        var staffMembers = await context.Staff
            .Where(s => s.TenantId == tenant.Id)
            .OrderBy(s => s.Id)
            .ToListAsync();

        if (!staffMembers.Any())
        {
            var newStaffMembers = new[]
            {
                new Staff
                {
                    TenantId = tenant.Id,
                    FirstName = "Emily",
                    LastName = "Carter",
                    Email = "emily@precision-auto.com",
                    Phone = "(555) 100-0001",
                    Role = StaffRole.Owner,
                    Status = StaffStatus.Active,
                    HourlyRate = 0,
                    Specializations = "Operations,Customer Relations,Estimates",
                    CertificationNumbers = "ASE-L1,ASE-A1"
                },
                new Staff
                {
                    TenantId = tenant.Id,
                    FirstName = "Marcus",
                    LastName = "Reed",
                    Email = "marcus@precision-auto.com",
                    Phone = "(555) 100-0002",
                    Role = StaffRole.Technician,
                    Status = StaffStatus.Active,
                    HourlyRate = 42.50m,
                    Specializations = "Diagnostics,Electrical,Driveability",
                    CertificationNumbers = "ASE-A6,ASE-A8"
                },
                new Staff
                {
                    TenantId = tenant.Id,
                    FirstName = "Chloe",
                    LastName = "Bennett",
                    Email = "chloe@precision-auto.com",
                    Phone = "(555) 100-0003",
                    Role = StaffRole.Technician,
                    Status = StaffStatus.Active,
                    HourlyRate = 41.00m,
                    Specializations = "Brakes,Suspension,Tires",
                    CertificationNumbers = "ASE-A4,ASE-A5"
                },
                new Staff
                {
                    TenantId = tenant.Id,
                    FirstName = "Nadia",
                    LastName = "Hussain",
                    Email = "nadia@precision-auto.com",
                    Phone = "(555) 100-0004",
                    Role = StaffRole.Dispatcher,
                    Status = StaffStatus.Active,
                    HourlyRate = 32.00m,
                    Specializations = "Scheduling,Workflow,Customer Updates"
                },
                new Staff
                {
                    TenantId = tenant.Id,
                    FirstName = "Luis",
                    LastName = "Torres",
                    Email = "luis@precision-auto.com",
                    Phone = "(555) 100-0005",
                    Role = StaffRole.Advisor,
                    Status = StaffStatus.Active,
                    HourlyRate = 34.00m,
                    Specializations = "Service Writing,Estimates,Customer Communication"
                }
            };

            context.Staff.AddRange(newStaffMembers);
            await context.SaveChangesAsync();
            staffMembers = newStaffMembers.ToList();
        }

        var ownerStaff = staffMembers.FirstOrDefault(s => s.Role == StaffRole.Owner) ?? staffMembers[0];
        var existingUser = await userManager.FindByEmailAsync(DemoUserEmail);
        if (existingUser == null)
        {
            var user = new ApplicationUser
            {
                UserName = DemoUserEmail,
                Email = DemoUserEmail,
                StaffId = ownerStaff.Id,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(user, DemoUserPassword);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Unable to create demo user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }
        else if (existingUser.StaffId != ownerStaff.Id)
        {
            existingUser.StaffId = ownerStaff.Id;
            var updateResult = await userManager.UpdateAsync(existingUser);
            if (!updateResult.Succeeded)
            {
                throw new InvalidOperationException($"Unable to update demo user: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}");
            }
        }
    }

    private static async Task EnsureCustomersAsync(MechanicShopContext context, Tenant tenant)
    {
        if (await context.Customers.AnyAsync(c => c.TenantId == tenant.Id))
        {
            return;
        }

        context.Customers.AddRange(
            new Customer
            {
                TenantId = tenant.Id,
                FirstName = "Alex",
                LastName = "Morgan",
                Email = "alex.morgan@example.com",
                Phone = "(555) 201-1001",
                Address = "18 Pinecrest Lane"
            },
            new Customer
            {
                TenantId = tenant.Id,
                FirstName = "Priya",
                LastName = "Patel",
                Email = "priya.patel@example.com",
                Phone = "(555) 201-1002",
                Address = "502 Oak Ridge Ave"
            },
            new Customer
            {
                TenantId = tenant.Id,
                FirstName = "Jordan",
                LastName = "Lee",
                Email = "jordan.lee@example.com",
                Phone = "(555) 201-1003",
                Address = "44 Harbor Way"
            },
            new Customer
            {
                TenantId = tenant.Id,
                FirstName = "Sofia",
                LastName = "Ramirez",
                Email = "sofia.ramirez@example.com",
                Phone = "(555) 201-1004",
                Address = "221 Sunset Blvd"
            },
            new Customer
            {
                TenantId = tenant.Id,
                FirstName = "Thomas",
                LastName = "Nguyen",
                Email = "thomas.nguyen@example.com",
                Phone = "(555) 201-1005",
                Address = "77 Market Street"
            },
            new Customer
            {
                TenantId = tenant.Id,
                FirstName = "Maya",
                LastName = "Johnson",
                Email = "maya.johnson@example.com",
                Phone = "(555) 201-1006",
                Address = "860 Lakeview Drive"
            }
        );

        await context.SaveChangesAsync();
    }

    private static async Task EnsureVehiclesAsync(MechanicShopContext context, Tenant tenant)
    {
        if (await context.Vehicles.AnyAsync(v => v.TenantId == tenant.Id))
        {
            return;
        }

        var customers = await context.Customers
            .Where(c => c.TenantId == tenant.Id)
            .OrderBy(c => c.Id)
            .ToListAsync();

        var vehicles = new List<Vehicle>
        {
            new()
            {
                TenantId = tenant.Id,
                CustomerId = customers[0].Id,
                Make = "Toyota",
                Model = "RAV4",
                Year = 2021,
                VIN = "JTMB1RFV7M1234001",
                LicensePlate = "NC-4821",
                Color = "Silver",
                Mileage = 28410
            },
            new()
            {
                TenantId = tenant.Id,
                CustomerId = customers[1].Id,
                Make = "Honda",
                Model = "Civic",
                Year = 2019,
                VIN = "2HGFC2F69KH123402",
                LicensePlate = "NC-1198",
                Color = "Blue",
                Mileage = 41250
            },
            new()
            {
                TenantId = tenant.Id,
                CustomerId = customers[2].Id,
                Make = "Ford",
                Model = "F-150",
                Year = 2020,
                VIN = "1FTFW1E58LFB23403",
                LicensePlate = "NC-7710",
                Color = "Black",
                Mileage = 35980
            },
            new()
            {
                TenantId = tenant.Id,
                CustomerId = customers[3].Id,
                Make = "Subaru",
                Model = "Outback",
                Year = 2018,
                VIN = "4S4BSANC9J3213404",
                LicensePlate = "NC-5502",
                Color = "Green",
                Mileage = 60790
            },
            new()
            {
                TenantId = tenant.Id,
                CustomerId = customers[4].Id,
                Make = "Tesla",
                Model = "Model 3",
                Year = 2022,
                VIN = "5YJ3E1EA9NF3213405",
                LicensePlate = "NC-EV33",
                Color = "White",
                Mileage = 18420
            },
            new()
            {
                TenantId = tenant.Id,
                CustomerId = customers[5].Id,
                Make = "Chevrolet",
                Model = "Silverado",
                Year = 2017,
                VIN = "1GC4KXCG7HF3213406",
                LicensePlate = "NC-9087",
                Color = "Red",
                Mileage = 88210
            }
        };

        context.Vehicles.AddRange(vehicles);
        await context.SaveChangesAsync();
    }

    private static async Task EnsureAppointmentsAsync(MechanicShopContext context, Tenant tenant)
    {
        if (await context.Appointments.AnyAsync(a => a.TenantId == tenant.Id))
        {
            return;
        }

        var staff = await context.Staff
            .Where(s => s.TenantId == tenant.Id)
            .OrderBy(s => s.Id)
            .ToListAsync();

        var customers = await context.Customers
            .Where(c => c.TenantId == tenant.Id)
            .OrderBy(c => c.Id)
            .ToListAsync();

        var vehicles = await context.Vehicles
            .Where(v => v.TenantId == tenant.Id)
            .OrderBy(v => v.Id)
            .ToListAsync();

        var now = DateTime.UtcNow;
        context.Appointments.AddRange(
            new Appointment
            {
                TenantId = tenant.Id,
                CustomerId = customers[0].Id,
                VehicleId = vehicles[0].Id,
                AssignedStaffId = staff[3].Id,
                ScheduledDate = now.Date.AddDays(1).AddHours(14),
                ServiceType = "Oil Change",
                Description = "Quick maintenance visit with full synthetic oil and inspection.",
                Status = AppointmentStatus.Scheduled,
                Notes = "Customer requested a text when ready."
            },
            new Appointment
            {
                TenantId = tenant.Id,
                CustomerId = customers[1].Id,
                VehicleId = vehicles[1].Id,
                AssignedStaffId = staff[4].Id,
                ScheduledDate = now.Date.AddHours(13),
                ServiceType = "Brake Inspection",
                Description = "Pedal vibration at highway speed.",
                Status = AppointmentStatus.InProgress,
                Notes = "Front pads near replacement threshold."
            },
            new Appointment
            {
                TenantId = tenant.Id,
                CustomerId = customers[2].Id,
                VehicleId = vehicles[2].Id,
                AssignedStaffId = staff[1].Id,
                ScheduledDate = now.Date.AddDays(-2).AddHours(10),
                ServiceType = "Diagnostics",
                Description = "Check engine light with intermittent misfire.",
                Status = AppointmentStatus.Completed,
                CompletedAt = now.AddDays(-2).AddHours(11),
                Notes = "Ignition coil replaced, road test passed."
            },
            new Appointment
            {
                TenantId = tenant.Id,
                CustomerId = customers[3].Id,
                VehicleId = vehicles[3].Id,
                AssignedStaffId = staff[1].Id,
                ScheduledDate = now.Date.AddDays(3).AddHours(9),
                ServiceType = "Alignment",
                Description = "Steering wheel pulls right after tire replacement.",
                Status = AppointmentStatus.Scheduled,
                Notes = "Needs four-wheel alignment."
            },
            new Appointment
            {
                TenantId = tenant.Id,
                CustomerId = customers[4].Id,
                VehicleId = vehicles[4].Id,
                AssignedStaffId = staff[2].Id,
                ScheduledDate = now.Date.AddDays(4).AddHours(15),
                ServiceType = "EV System Check",
                Description = "Routine battery and cabin filter service.",
                Status = AppointmentStatus.Scheduled,
                Notes = "Client waiting area preferred."
            },
            new Appointment
            {
                TenantId = tenant.Id,
                CustomerId = customers[5].Id,
                VehicleId = vehicles[5].Id,
                AssignedStaffId = staff[4].Id,
                ScheduledDate = now.Date.AddDays(-1).AddHours(11),
                ServiceType = "Air Conditioning",
                Description = "A/C blowing warm at idle.",
                Status = AppointmentStatus.NoShow,
                Notes = "No contact after confirmation call."
            }
        );

        await context.SaveChangesAsync();
    }

    private static async Task EnsureServiceRecordsAsync(MechanicShopContext context, Tenant tenant)
    {
        if (await context.ServiceRecords.AnyAsync(s => s.TenantId == tenant.Id))
        {
            return;
        }

        var staff = await context.Staff
            .Where(s => s.TenantId == tenant.Id)
            .OrderBy(s => s.Id)
            .ToListAsync();

        var vehicles = await context.Vehicles
            .Where(v => v.TenantId == tenant.Id)
            .OrderBy(v => v.Id)
            .ToListAsync();

        var now = DateTime.UtcNow;
        context.ServiceRecords.AddRange(
            new ServiceRecord
            {
                TenantId = tenant.Id,
                VehicleId = vehicles[2].Id,
                PerformedByStaffId = staff[1].Id,
                ServiceDate = now.AddDays(-2),
                ServiceType = "Ignition Coil Replacement",
                Description = "Replaced faulty coil, verified misfire counts, and completed road test.",
                LaborCost = 168.00m,
                PartsCost = 74.50m,
                MileageAtService = 35960,
                TechnicianName = staff[1].FullName,
                Notes = "Customer approved estimate quickly."
            },
            new ServiceRecord
            {
                TenantId = tenant.Id,
                VehicleId = vehicles[1].Id,
                PerformedByStaffId = staff[4].Id,
                ServiceDate = now.AddDays(-5),
                ServiceType = "Front Brake Service",
                Description = "Pads and rotors replaced, brake fluid inspected, test drive completed.",
                LaborCost = 210.00m,
                PartsCost = 235.40m,
                MileageAtService = 41022,
                TechnicianName = staff[4].FullName,
                Notes = "Returned clean, no squeal on road test."
            },
            new ServiceRecord
            {
                TenantId = tenant.Id,
                VehicleId = vehicles[0].Id,
                PerformedByStaffId = staff[3].Id,
                ServiceDate = now.AddDays(-8),
                ServiceType = "Synthetic Oil Service",
                Description = "Oil and filter change, cabin filter inspection, and fluid top-off.",
                LaborCost = 65.00m,
                PartsCost = 24.95m,
                MileageAtService = 28120,
                TechnicianName = staff[3].FullName,
                Notes = "Suggested tire rotation next visit."
            },
            new ServiceRecord
            {
                TenantId = tenant.Id,
                VehicleId = vehicles[3].Id,
                PerformedByStaffId = staff[1].Id,
                ServiceDate = now.AddDays(-12),
                ServiceType = "Cooling System Flush",
                Description = "Flushed coolant, checked hoses, and pressure-tested the system.",
                LaborCost = 145.00m,
                PartsCost = 88.25m,
                MileageAtService = 60610,
                TechnicianName = staff[1].FullName,
                Notes = "No leaks found after pressure test."
            },
            new ServiceRecord
            {
                TenantId = tenant.Id,
                VehicleId = vehicles[4].Id,
                PerformedByStaffId = staff[3].Id,
                ServiceDate = now.AddDays(-16),
                ServiceType = "Cabin Filter Replacement",
                Description = "Cabin filter replaced and HVAC system inspected.",
                LaborCost = 54.00m,
                PartsCost = 31.00m,
                MileageAtService = 17890,
                TechnicianName = staff[3].FullName,
                Notes = "EV service visit complete."
            }
        );

        await context.SaveChangesAsync();
    }

    private static string BuildAvailabilityRules()
    {
        var rules = new AvailabilityRules
        {
            Timezone = "America/New_York",
            SlotDurationMinutes = 30,
            BufferMinutes = 10,
            MaxAdvanceBookingDays = 45,
            MinAdvanceBookingHours = 2,
            ClosedDates =
            {
                DateTime.SpecifyKind(new DateTime(DateTime.UtcNow.Year, 7, 4), DateTimeKind.Utc).ToString("yyyy-MM-dd"),
                DateTime.SpecifyKind(new DateTime(DateTime.UtcNow.Year, 12, 25), DateTimeKind.Utc).ToString("yyyy-MM-dd")
            }
        };

        rules.WeeklySchedule = new Dictionary<DayOfWeek, DaySchedule?>
        {
            { DayOfWeek.Monday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "18:00" } },
            { DayOfWeek.Tuesday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "18:00" } },
            { DayOfWeek.Wednesday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "18:00" } },
            { DayOfWeek.Thursday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "18:00" } },
            { DayOfWeek.Friday, new DaySchedule { IsOpen = true, OpenTime = "08:00", CloseTime = "17:00" } },
            { DayOfWeek.Saturday, new DaySchedule { IsOpen = true, OpenTime = "09:00", CloseTime = "14:00" } },
            { DayOfWeek.Sunday, new DaySchedule { IsOpen = false } }
        };

        return JsonSerializer.Serialize(rules);
    }
}
