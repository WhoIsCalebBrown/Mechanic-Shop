using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MechanicShopAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BrandingSettings",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Timezone",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "HolidayOverrides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    OpenTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    CloseTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HolidayOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HolidayOverrides_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    NewBookingEmail = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentReceivedEmail = table.Column<bool>(type: "boolean", nullable: false),
                    AppointmentReminderEmail = table.Column<bool>(type: "boolean", nullable: false),
                    CancellationEmail = table.Column<bool>(type: "boolean", nullable: false),
                    NewBookingSms = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentReceivedSms = table.Column<bool>(type: "boolean", nullable: false),
                    AppointmentReminderSms = table.Column<bool>(type: "boolean", nullable: false),
                    CancellationSms = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationPreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationPreferences_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BrandingSettings", "Timezone" },
                values: new object[] { null, "America/New_York" });

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "BrandingSettings", "Timezone" },
                values: new object[] { null, "America/New_York" });

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "BrandingSettings", "Timezone" },
                values: new object[] { null, "America/New_York" });

            migrationBuilder.CreateIndex(
                name: "IX_HolidayOverrides_TenantId",
                table: "HolidayOverrides",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_HolidayOverrides_TenantId_Date",
                table: "HolidayOverrides",
                columns: new[] { "TenantId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationPreferences_TenantId",
                table: "NotificationPreferences",
                column: "TenantId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HolidayOverrides");

            migrationBuilder.DropTable(
                name: "NotificationPreferences");

            migrationBuilder.DropColumn(
                name: "BrandingSettings",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "Timezone",
                table: "Tenants");
        }
    }
}
