using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MechanicShopAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSiteSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SiteSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BusinessName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Tagline = table.Column<string>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: false),
                    City = table.Column<string>(type: "TEXT", nullable: false),
                    State = table.Column<string>(type: "TEXT", nullable: false),
                    ZipCode = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    MondayFridayHours = table.Column<string>(type: "TEXT", nullable: false),
                    SaturdayHours = table.Column<string>(type: "TEXT", nullable: false),
                    SundayHours = table.Column<string>(type: "TEXT", nullable: false),
                    VehiclesServiced = table.Column<int>(type: "INTEGER", nullable: false),
                    SatisfactionRate = table.Column<int>(type: "INTEGER", nullable: false),
                    YearsExperience = table.Column<int>(type: "INTEGER", nullable: false),
                    HeroTitle = table.Column<string>(type: "TEXT", nullable: false),
                    HeroSubtitle = table.Column<string>(type: "TEXT", nullable: false),
                    PrimaryCtaText = table.Column<string>(type: "TEXT", nullable: false),
                    SecondaryCtaText = table.Column<string>(type: "TEXT", nullable: false),
                    Service1Title = table.Column<string>(type: "TEXT", nullable: false),
                    Service1Description = table.Column<string>(type: "TEXT", nullable: false),
                    Service1Feature1 = table.Column<string>(type: "TEXT", nullable: false),
                    Service1Feature2 = table.Column<string>(type: "TEXT", nullable: false),
                    Service1Feature3 = table.Column<string>(type: "TEXT", nullable: false),
                    Service1Feature4 = table.Column<string>(type: "TEXT", nullable: false),
                    Service2Title = table.Column<string>(type: "TEXT", nullable: false),
                    Service2Description = table.Column<string>(type: "TEXT", nullable: false),
                    Service2Feature1 = table.Column<string>(type: "TEXT", nullable: false),
                    Service2Feature2 = table.Column<string>(type: "TEXT", nullable: false),
                    Service2Feature3 = table.Column<string>(type: "TEXT", nullable: false),
                    Service2Feature4 = table.Column<string>(type: "TEXT", nullable: false),
                    Service3Title = table.Column<string>(type: "TEXT", nullable: false),
                    Service3Description = table.Column<string>(type: "TEXT", nullable: false),
                    Service3Feature1 = table.Column<string>(type: "TEXT", nullable: false),
                    Service3Feature2 = table.Column<string>(type: "TEXT", nullable: false),
                    Service3Feature3 = table.Column<string>(type: "TEXT", nullable: false),
                    Service3Feature4 = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature1Title = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature1Description = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature2Title = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature2Description = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature3Title = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature3Description = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature4Title = table.Column<string>(type: "TEXT", nullable: false),
                    WhyFeature4Description = table.Column<string>(type: "TEXT", nullable: false),
                    CtaTitle = table.Column<string>(type: "TEXT", nullable: false),
                    CtaSubtitle = table.Column<string>(type: "TEXT", nullable: false),
                    CtaButtonText = table.Column<string>(type: "TEXT", nullable: false),
                    LogoUrl = table.Column<string>(type: "TEXT", nullable: true),
                    HeroImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SiteSettings");
        }
    }
}
