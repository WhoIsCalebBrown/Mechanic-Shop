namespace MechanicShopAPI.Models;

public class SiteSettings
{
    public int Id { get; set; }

    // Multi-tenancy
    public int? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    // Business Information
    public string BusinessName { get; set; } = "Precision Automotive";
    public string Tagline { get; set; } = "Expert Service for Your Vehicle";
    public string Address { get; set; } = "123 Auto Street";
    public string City { get; set; } = "City";
    public string State { get; set; } = "State";
    public string ZipCode { get; set; } = "12345";
    public string Phone { get; set; } = "(555) 123-4567";
    public string Email { get; set; } = "info@mechanic.com";

    // Hours
    public string MondayFridayHours { get; set; } = "8am - 6pm";
    public string SaturdayHours { get; set; } = "9am - 4pm";
    public string SundayHours { get; set; } = "Closed";

    // Stats
    public int VehiclesServiced { get; set; } = 5000;
    public int SatisfactionRate { get; set; } = 98;
    public int YearsExperience { get; set; } = 25;

    // Hero Section
    public string HeroTitle { get; set; } = "PRECISION\nAUTOMOTIVE\nCARE";
    public string HeroSubtitle { get; set; } = "Expert Service for Your Vehicle";
    public string PrimaryCtaText { get; set; } = "Schedule Service";
    public string SecondaryCtaText { get; set; } = "Our Services";

    // Services
    public string Service1Title { get; set; } = "Routine Maintenance";
    public string Service1Description { get; set; } = "Oil changes, filter replacements, fluid checks, and comprehensive inspections to keep your vehicle running smoothly.";
    public string Service1Feature1 { get; set; } = "Oil & Filter Change";
    public string Service1Feature2 { get; set; } = "Brake Inspection";
    public string Service1Feature3 { get; set; } = "Tire Rotation";
    public string Service1Feature4 { get; set; } = "Fluid Top-ups";
    public string? Service1ImageUrl { get; set; }

    public string Service2Title { get; set; } = "Diagnostics & Repair";
    public string Service2Description { get; set; } = "Advanced diagnostic tools and expert technicians to identify and resolve any mechanical or electrical issues.";
    public string Service2Feature1 { get; set; } = "Computer Diagnostics";
    public string Service2Feature2 { get; set; } = "Engine Repair";
    public string Service2Feature3 { get; set; } = "Transmission Service";
    public string Service2Feature4 { get; set; } = "Electrical Systems";
    public string? Service2ImageUrl { get; set; }

    public string Service3Title { get; set; } = "Performance Upgrades";
    public string Service3Description { get; set; } = "Enhance your vehicle's performance with professional tuning, upgrades, and custom modifications.";
    public string Service3Feature1 { get; set; } = "Engine Tuning";
    public string Service3Feature2 { get; set; } = "Suspension Upgrades";
    public string Service3Feature3 { get; set; } = "Exhaust Systems";
    public string Service3Feature4 { get; set; } = "Brake Upgrades";
    public string? Service3ImageUrl { get; set; }

    // Why Choose Us
    public string WhyFeature1Title { get; set; } = "Expert Technicians";
    public string WhyFeature1Description { get; set; } = "ASE-certified mechanics with decades of combined experience";

    public string WhyFeature2Title { get; set; } = "Quality Parts";
    public string WhyFeature2Description { get; set; } = "We use only OEM and premium aftermarket parts";

    public string WhyFeature3Title { get; set; } = "Transparent Pricing";
    public string WhyFeature3Description { get; set; } = "No hidden fees, detailed estimates before any work begins";

    public string WhyFeature4Title { get; set; } = "Warranty Coverage";
    public string WhyFeature4Description { get; set; } = "All services backed by our comprehensive warranty";

    // CTA Section
    public string CtaTitle { get; set; } = "Ready to Get Started?";
    public string CtaSubtitle { get; set; } = "Schedule your service appointment today";
    public string CtaButtonText { get; set; } = "Book Appointment";

    // Images (stored as base64 or URLs)
    public string? LogoUrl { get; set; }
    public string? HeroImageUrl { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
