using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MechanicShopAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantOnboardingAndServiceItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvailabilityRules",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "BookingEnabled",
                table: "Tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "OnboardingCompleted",
                table: "Tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "OnboardingCompletedAt",
                table: "Tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OnboardingStep",
                table: "Tenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ServiceItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    BasePrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsBookableOnline = table.Column<bool>(type: "boolean", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceItems_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AvailabilityRules", "BookingEnabled", "OnboardingCompleted", "OnboardingCompletedAt", "OnboardingStep" },
                values: new object[] { null, false, false, null, 0 });

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AvailabilityRules", "BookingEnabled", "OnboardingCompleted", "OnboardingCompletedAt", "OnboardingStep" },
                values: new object[] { null, false, false, null, 0 });

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "AvailabilityRules", "BookingEnabled", "OnboardingCompleted", "OnboardingCompletedAt", "OnboardingStep" },
                values: new object[] { null, false, false, null, 0 });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceItems_TenantId",
                table: "ServiceItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceItems_TenantId_IsActive",
                table: "ServiceItems",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceItems_TenantId_IsBookableOnline",
                table: "ServiceItems",
                columns: new[] { "TenantId", "IsBookableOnline" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceItems");

            migrationBuilder.DropColumn(
                name: "AvailabilityRules",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "BookingEnabled",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "OnboardingCompleted",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "OnboardingCompletedAt",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "OnboardingStep",
                table: "Tenants");
        }
    }
}
