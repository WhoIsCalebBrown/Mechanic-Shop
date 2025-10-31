using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MechanicShopAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffAndRepairOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SiteSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BusinessName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Tagline = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    State = table.Column<string>(type: "text", nullable: false),
                    ZipCode = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    MondayFridayHours = table.Column<string>(type: "text", nullable: false),
                    SaturdayHours = table.Column<string>(type: "text", nullable: false),
                    SundayHours = table.Column<string>(type: "text", nullable: false),
                    VehiclesServiced = table.Column<int>(type: "integer", nullable: false),
                    SatisfactionRate = table.Column<int>(type: "integer", nullable: false),
                    YearsExperience = table.Column<int>(type: "integer", nullable: false),
                    HeroTitle = table.Column<string>(type: "text", nullable: false),
                    HeroSubtitle = table.Column<string>(type: "text", nullable: false),
                    PrimaryCtaText = table.Column<string>(type: "text", nullable: false),
                    SecondaryCtaText = table.Column<string>(type: "text", nullable: false),
                    Service1Title = table.Column<string>(type: "text", nullable: false),
                    Service1Description = table.Column<string>(type: "text", nullable: false),
                    Service1Feature1 = table.Column<string>(type: "text", nullable: false),
                    Service1Feature2 = table.Column<string>(type: "text", nullable: false),
                    Service1Feature3 = table.Column<string>(type: "text", nullable: false),
                    Service1Feature4 = table.Column<string>(type: "text", nullable: false),
                    Service1ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Service2Title = table.Column<string>(type: "text", nullable: false),
                    Service2Description = table.Column<string>(type: "text", nullable: false),
                    Service2Feature1 = table.Column<string>(type: "text", nullable: false),
                    Service2Feature2 = table.Column<string>(type: "text", nullable: false),
                    Service2Feature3 = table.Column<string>(type: "text", nullable: false),
                    Service2Feature4 = table.Column<string>(type: "text", nullable: false),
                    Service2ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Service3Title = table.Column<string>(type: "text", nullable: false),
                    Service3Description = table.Column<string>(type: "text", nullable: false),
                    Service3Feature1 = table.Column<string>(type: "text", nullable: false),
                    Service3Feature2 = table.Column<string>(type: "text", nullable: false),
                    Service3Feature3 = table.Column<string>(type: "text", nullable: false),
                    Service3Feature4 = table.Column<string>(type: "text", nullable: false),
                    Service3ImageUrl = table.Column<string>(type: "text", nullable: true),
                    WhyFeature1Title = table.Column<string>(type: "text", nullable: false),
                    WhyFeature1Description = table.Column<string>(type: "text", nullable: false),
                    WhyFeature2Title = table.Column<string>(type: "text", nullable: false),
                    WhyFeature2Description = table.Column<string>(type: "text", nullable: false),
                    WhyFeature3Title = table.Column<string>(type: "text", nullable: false),
                    WhyFeature3Description = table.Column<string>(type: "text", nullable: false),
                    WhyFeature4Title = table.Column<string>(type: "text", nullable: false),
                    WhyFeature4Description = table.Column<string>(type: "text", nullable: false),
                    CtaTitle = table.Column<string>(type: "text", nullable: false),
                    CtaSubtitle = table.Column<string>(type: "text", nullable: false),
                    CtaButtonText = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    HeroImageUrl = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BusinessAddress = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    State = table.Column<string>(type: "text", nullable: true),
                    ZipCode = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Website = table.Column<string>(type: "text", nullable: true),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Plan = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TrialEndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SubscriptionEndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IntegrationSettings = table.Column<string>(type: "text", nullable: true),
                    MediaStoragePath = table.Column<string>(type: "text", nullable: true),
                    StorageUsedBytes = table.Column<long>(type: "bigint", nullable: false),
                    StorageLimitBytes = table.Column<long>(type: "bigint", nullable: false),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxCustomers = table.Column<int>(type: "integer", nullable: false),
                    MaxVehicles = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Customers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Staff",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    HireDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TerminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HourlyRate = table.Column<decimal>(type: "numeric", nullable: true),
                    Specializations = table.Column<string>(type: "text", nullable: true),
                    CertificationNumbers = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Staff", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Staff_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    Make = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Model = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    VIN = table.Column<string>(type: "text", nullable: true),
                    LicensePlate = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Mileage = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vehicles_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Vehicles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    AssignedStaffId = table.Column<int>(type: "integer", nullable: true),
                    ScheduledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ServiceType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Appointments_Staff_AssignedStaffId",
                        column: x => x.AssignedStaffId,
                        principalTable: "Staff",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Appointments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Appointments_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RepairOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    AppointmentId = table.Column<int>(type: "integer", nullable: true),
                    AssignedTechnicianId = table.Column<int>(type: "integer", nullable: true),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ScheduledStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedCompletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualCompletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedLaborCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    EstimatedPartsCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ActualLaborCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ActualPartsCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    EstimatedLaborHours = table.Column<decimal>(type: "numeric", nullable: true),
                    ActualLaborHours = table.Column<decimal>(type: "numeric", nullable: true),
                    MileageIn = table.Column<int>(type: "integer", nullable: true),
                    MileageOut = table.Column<int>(type: "integer", nullable: true),
                    CustomerNotes = table.Column<string>(type: "text", nullable: true),
                    TechnicianNotes = table.Column<string>(type: "text", nullable: true),
                    InternalNotes = table.Column<string>(type: "text", nullable: true),
                    CustomerApproved = table.Column<bool>(type: "boolean", nullable: false),
                    CustomerApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerSignature = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepairOrders_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RepairOrders_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepairOrders_Staff_AssignedTechnicianId",
                        column: x => x.AssignedTechnicianId,
                        principalTable: "Staff",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RepairOrders_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RepairOrders_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    RepairOrderId = table.Column<int>(type: "integer", nullable: true),
                    PerformedByStaffId = table.Column<int>(type: "integer", nullable: true),
                    ServiceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ServiceType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    LaborCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    PartsCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MileageAtService = table.Column<int>(type: "integer", nullable: true),
                    TechnicianName = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceRecords_RepairOrders_RepairOrderId",
                        column: x => x.RepairOrderId,
                        principalTable: "RepairOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceRecords_Staff_PerformedByStaffId",
                        column: x => x.PerformedByStaffId,
                        principalTable: "Staff",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceRecords_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceRecords_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "SiteSettings",
                columns: new[] { "Id", "Address", "BusinessName", "City", "CtaButtonText", "CtaSubtitle", "CtaTitle", "Email", "HeroImageUrl", "HeroSubtitle", "HeroTitle", "LogoUrl", "MondayFridayHours", "Phone", "PrimaryCtaText", "SatisfactionRate", "SaturdayHours", "SecondaryCtaText", "Service1Description", "Service1Feature1", "Service1Feature2", "Service1Feature3", "Service1Feature4", "Service1ImageUrl", "Service1Title", "Service2Description", "Service2Feature1", "Service2Feature2", "Service2Feature3", "Service2Feature4", "Service2ImageUrl", "Service2Title", "Service3Description", "Service3Feature1", "Service3Feature2", "Service3Feature3", "Service3Feature4", "Service3ImageUrl", "Service3Title", "State", "SundayHours", "Tagline", "UpdatedAt", "VehiclesServiced", "WhyFeature1Description", "WhyFeature1Title", "WhyFeature2Description", "WhyFeature2Title", "WhyFeature3Description", "WhyFeature3Title", "WhyFeature4Description", "WhyFeature4Title", "YearsExperience", "ZipCode" },
                values: new object[] { 1, "123 Auto Street", "Precision Automotive", "City", "Book Appointment", "Schedule your service appointment today", "Ready to Get Started?", "info@mechanic.com", null, "Expert Service for Your Vehicle", "PRECISION\nAUTOMOTIVE\nCARE", null, "8am - 6pm", "(555) 123-4567", "Schedule Service", 98, "9am - 4pm", "Our Services", "Oil changes, filter replacements, fluid checks, and comprehensive inspections to keep your vehicle running smoothly.", "Oil & Filter Change", "Brake Inspection", "Tire Rotation", "Fluid Top-ups", null, "Routine Maintenance", "Advanced diagnostic tools and expert technicians to identify and resolve any mechanical or electrical issues.", "Computer Diagnostics", "Engine Repair", "Transmission Service", "Electrical Systems", null, "Diagnostics & Repair", "Enhance your vehicle's performance with professional tuning, upgrades, and custom modifications.", "Engine Tuning", "Suspension Upgrades", "Exhaust Systems", "Brake Upgrades", null, "Performance Upgrades", "State", "Closed", "Expert Service for Your Vehicle", new DateTime(2025, 10, 30, 0, 0, 0, 0, DateTimeKind.Utc), 5000, "ASE-certified mechanics with decades of combined experience", "Expert Technicians", "We use only OEM and premium aftermarket parts", "Quality Parts", "No hidden fees, detailed estimates before any work begins", "Transparent Pricing", "All services backed by our comprehensive warranty", "Warranty Coverage", 25, "12345" });

            migrationBuilder.InsertData(
                table: "Tenants",
                columns: new[] { "Id", "BusinessAddress", "City", "Country", "CreatedAt", "CreatedBy", "Description", "Email", "IntegrationSettings", "LogoUrl", "MaxCustomers", "MaxUsers", "MaxVehicles", "MediaStoragePath", "Name", "Phone", "Plan", "Slug", "State", "Status", "StorageLimitBytes", "StorageUsedBytes", "SubscriptionEndsAt", "TrialEndsAt", "UpdatedAt", "Website", "ZipCode" },
                values: new object[,]
                {
                    { 1, "123 Main Street", "Springfield", "US", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "contact@precision-auto.com", null, null, 1000, 10, 2000, "/tenants/precision-auto/media", "Precision Automotive", "(555) 123-4567", 2, "precision-auto", "IL", 0, 5368709120L, 0L, null, null, null, null, "62701" },
                    { 2, "456 Industrial Blvd", "Chicago", "US", new DateTime(2025, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "info@acme-motors.com", null, null, 500, 5, 1000, "/tenants/acme-motors/media", "ACME Motors & Repair", "(555) 987-6543", 1, "acme-motors", "IL", 0, 5368709120L, 0L, null, null, null, null, "60601" },
                    { 3, "789 Speedway Drive", "Indianapolis", "US", new DateTime(2024, 12, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "service@speedway.com", null, null, 10000, 50, 20000, "/tenants/speedway-service/media", "Speedway Service Center", "(555) 555-0123", 3, "speedway-service", "IN", 0, 5368709120L, 0L, null, null, null, null, "46204" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_AssignedStaffId",
                table: "Appointments",
                column: "AssignedStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CustomerId",
                table: "Appointments",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId",
                table: "Appointments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId_ScheduledDate",
                table: "Appointments",
                columns: new[] { "TenantId", "ScheduledDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId_Status",
                table: "Appointments",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_VehicleId",
                table: "Appointments",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId",
                table: "Customers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_Email",
                table: "Customers",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_AppointmentId",
                table: "RepairOrders",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_AssignedTechnicianId",
                table: "RepairOrders",
                column: "AssignedTechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_CustomerId",
                table: "RepairOrders",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_TenantId",
                table: "RepairOrders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_TenantId_OrderNumber",
                table: "RepairOrders",
                columns: new[] { "TenantId", "OrderNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_TenantId_Status",
                table: "RepairOrders",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_VehicleId",
                table: "RepairOrders",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecords_PerformedByStaffId",
                table: "ServiceRecords",
                column: "PerformedByStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecords_RepairOrderId",
                table: "ServiceRecords",
                column: "RepairOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecords_TenantId",
                table: "ServiceRecords",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecords_TenantId_ServiceDate",
                table: "ServiceRecords",
                columns: new[] { "TenantId", "ServiceDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecords_VehicleId",
                table: "ServiceRecords",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Staff_TenantId",
                table: "Staff",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Staff_TenantId_Email",
                table: "Staff",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Staff_TenantId_Role",
                table: "Staff",
                columns: new[] { "TenantId", "Role" });

            migrationBuilder.CreateIndex(
                name: "IX_Staff_TenantId_Status",
                table: "Staff",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Staff_UserId",
                table: "Staff",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Plan",
                table: "Tenants",
                column: "Plan");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Slug",
                table: "Tenants",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Status",
                table: "Tenants",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CustomerId",
                table: "Vehicles",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_TenantId",
                table: "Vehicles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_TenantId_CustomerId",
                table: "Vehicles",
                columns: new[] { "TenantId", "CustomerId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceRecords");

            migrationBuilder.DropTable(
                name: "SiteSettings");

            migrationBuilder.DropTable(
                name: "RepairOrders");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Staff");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "Tenants");
        }
    }
}
