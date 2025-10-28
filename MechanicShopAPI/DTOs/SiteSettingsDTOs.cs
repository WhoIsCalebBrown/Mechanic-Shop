namespace MechanicShopAPI.DTOs;

public class SiteSettingsDto
{
    public int Id { get; set; }

    // Business Information
    public string BusinessName { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Hours
    public string MondayFridayHours { get; set; } = string.Empty;
    public string SaturdayHours { get; set; } = string.Empty;
    public string SundayHours { get; set; } = string.Empty;

    // Stats
    public int VehiclesServiced { get; set; }
    public int SatisfactionRate { get; set; }
    public int YearsExperience { get; set; }

    // Hero Section
    public string HeroTitle { get; set; } = string.Empty;
    public string HeroSubtitle { get; set; } = string.Empty;
    public string PrimaryCtaText { get; set; } = string.Empty;
    public string SecondaryCtaText { get; set; } = string.Empty;

    // Services
    public string Service1Title { get; set; } = string.Empty;
    public string Service1Description { get; set; } = string.Empty;
    public string Service1Feature1 { get; set; } = string.Empty;
    public string Service1Feature2 { get; set; } = string.Empty;
    public string Service1Feature3 { get; set; } = string.Empty;
    public string Service1Feature4 { get; set; } = string.Empty;
    public string? Service1ImageUrl { get; set; }

    public string Service2Title { get; set; } = string.Empty;
    public string Service2Description { get; set; } = string.Empty;
    public string Service2Feature1 { get; set; } = string.Empty;
    public string Service2Feature2 { get; set; } = string.Empty;
    public string Service2Feature3 { get; set; } = string.Empty;
    public string Service2Feature4 { get; set; } = string.Empty;
    public string? Service2ImageUrl { get; set; }

    public string Service3Title { get; set; } = string.Empty;
    public string Service3Description { get; set; } = string.Empty;
    public string Service3Feature1 { get; set; } = string.Empty;
    public string Service3Feature2 { get; set; } = string.Empty;
    public string Service3Feature3 { get; set; } = string.Empty;
    public string Service3Feature4 { get; set; } = string.Empty;
    public string? Service3ImageUrl { get; set; }

    // Why Choose Us
    public string WhyFeature1Title { get; set; } = string.Empty;
    public string WhyFeature1Description { get; set; } = string.Empty;
    public string WhyFeature2Title { get; set; } = string.Empty;
    public string WhyFeature2Description { get; set; } = string.Empty;
    public string WhyFeature3Title { get; set; } = string.Empty;
    public string WhyFeature3Description { get; set; } = string.Empty;
    public string WhyFeature4Title { get; set; } = string.Empty;
    public string WhyFeature4Description { get; set; } = string.Empty;

    // CTA Section
    public string CtaTitle { get; set; } = string.Empty;
    public string CtaSubtitle { get; set; } = string.Empty;
    public string CtaButtonText { get; set; } = string.Empty;

    // Images
    public string? LogoUrl { get; set; }
    public string? HeroImageUrl { get; set; }

    public DateTime UpdatedAt { get; set; }
}

public class UpdateSiteSettingsDto
{
    // Business Information
    public string? BusinessName { get; set; }
    public string? Tagline { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    // Hours
    public string? MondayFridayHours { get; set; }
    public string? SaturdayHours { get; set; }
    public string? SundayHours { get; set; }

    // Stats
    public int? VehiclesServiced { get; set; }
    public int? SatisfactionRate { get; set; }
    public int? YearsExperience { get; set; }

    // Hero Section
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? PrimaryCtaText { get; set; }
    public string? SecondaryCtaText { get; set; }

    // Services
    public string? Service1Title { get; set; }
    public string? Service1Description { get; set; }
    public string? Service1Feature1 { get; set; }
    public string? Service1Feature2 { get; set; }
    public string? Service1Feature3 { get; set; }
    public string? Service1Feature4 { get; set; }
    public string? Service1ImageUrl { get; set; }

    public string? Service2Title { get; set; }
    public string? Service2Description { get; set; }
    public string? Service2Feature1 { get; set; }
    public string? Service2Feature2 { get; set; }
    public string? Service2Feature3 { get; set; }
    public string? Service2Feature4 { get; set; }
    public string? Service2ImageUrl { get; set; }

    public string? Service3Title { get; set; }
    public string? Service3Description { get; set; }
    public string? Service3Feature1 { get; set; }
    public string? Service3Feature2 { get; set; }
    public string? Service3Feature3 { get; set; }
    public string? Service3Feature4 { get; set; }
    public string? Service3ImageUrl { get; set; }

    // Why Choose Us
    public string? WhyFeature1Title { get; set; }
    public string? WhyFeature1Description { get; set; }
    public string? WhyFeature2Title { get; set; }
    public string? WhyFeature2Description { get; set; }
    public string? WhyFeature3Title { get; set; }
    public string? WhyFeature3Description { get; set; }
    public string? WhyFeature4Title { get; set; }
    public string? WhyFeature4Description { get; set; }

    // CTA Section
    public string? CtaTitle { get; set; }
    public string? CtaSubtitle { get; set; }
    public string? CtaButtonText { get; set; }

    // Images
    public string? LogoUrl { get; set; }
    public string? HeroImageUrl { get; set; }
}
