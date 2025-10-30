using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MechanicShopAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSQLMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
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
                });

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
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
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
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
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
                        name: "FK_Appointments_Vehicles_VehicleId",
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
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CustomerId",
                table: "Appointments",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_VehicleId",
                table: "Appointments",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Email",
                table: "Customers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecords_VehicleId",
                table: "ServiceRecords",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CustomerId",
                table: "Vehicles",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "ServiceRecords");

            migrationBuilder.DropTable(
                name: "SiteSettings");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}
