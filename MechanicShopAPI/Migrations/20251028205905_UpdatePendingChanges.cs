using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MechanicShopAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Migration intentionally empty - SiteSettings table is created in next migration
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Migration intentionally empty - SiteSettings table is dropped in next migration's Down method
        }
    }
}
