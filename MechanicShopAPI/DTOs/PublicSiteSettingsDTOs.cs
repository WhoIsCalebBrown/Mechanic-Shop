namespace MechanicShopAPI.DTOs;

/// <summary>
/// Public-facing DTO for tenant's landing page (no sensitive data)
/// </summary>
public class PublicSiteSettingsDto
{
    // Business Info
    public string BusinessName { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Contact Info (public)
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }

    // Address (public)
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }

    // Branding
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }

    // Stats
    public int VehiclesServiced { get; set; }
    public int SatisfactionRate { get; set; }
    public int YearsExperience { get; set; }

    // Hero Section
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? PrimaryCtaText { get; set; }
    public string? SecondaryCtaText { get; set; }
    public string? HeroImageUrl { get; set; }

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

    // Business Hours (simplified for public)
    public List<BusinessHourDto> BusinessHours { get; set; } = new();

    // Meta
    public bool BookingEnabled { get; set; }
    public string TimeZone { get; set; } = "America/New_York";
}

/// <summary>
/// Business hours for a single day
/// </summary>
public class BusinessHourDto
{
    public string Day { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
}

/// <summary>
/// Contact form submission from public page
/// </summary>
public class PublicContactFormDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? PreferredService { get; set; }
}
