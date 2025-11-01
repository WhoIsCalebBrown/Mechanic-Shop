using System;
using System.Collections.Generic;

namespace MechanicShopAPI;

public partial class SiteSetting
{
    public int Id { get; set; }

    public string BusinessName { get; set; } = null!;

    public string Tagline { get; set; } = null!;

    public string Address { get; set; } = null!;

    public string City { get; set; } = null!;

    public string State { get; set; } = null!;

    public string ZipCode { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string MondayFridayHours { get; set; } = null!;

    public string SaturdayHours { get; set; } = null!;

    public string SundayHours { get; set; } = null!;

    public int VehiclesServiced { get; set; }

    public int SatisfactionRate { get; set; }

    public int YearsExperience { get; set; }

    public string HeroTitle { get; set; } = null!;

    public string HeroSubtitle { get; set; } = null!;

    public string PrimaryCtaText { get; set; } = null!;

    public string SecondaryCtaText { get; set; } = null!;

    public string Service1Title { get; set; } = null!;

    public string Service1Description { get; set; } = null!;

    public string Service1Feature1 { get; set; } = null!;

    public string Service1Feature2 { get; set; } = null!;

    public string Service1Feature3 { get; set; } = null!;

    public string Service1Feature4 { get; set; } = null!;

    public string? Service1ImageUrl { get; set; }

    public string Service2Title { get; set; } = null!;

    public string Service2Description { get; set; } = null!;

    public string Service2Feature1 { get; set; } = null!;

    public string Service2Feature2 { get; set; } = null!;

    public string Service2Feature3 { get; set; } = null!;

    public string Service2Feature4 { get; set; } = null!;

    public string? Service2ImageUrl { get; set; }

    public string Service3Title { get; set; } = null!;

    public string Service3Description { get; set; } = null!;

    public string Service3Feature1 { get; set; } = null!;

    public string Service3Feature2 { get; set; } = null!;

    public string Service3Feature3 { get; set; } = null!;

    public string Service3Feature4 { get; set; } = null!;

    public string? Service3ImageUrl { get; set; }

    public string WhyFeature1Title { get; set; } = null!;

    public string WhyFeature1Description { get; set; } = null!;

    public string WhyFeature2Title { get; set; } = null!;

    public string WhyFeature2Description { get; set; } = null!;

    public string WhyFeature3Title { get; set; } = null!;

    public string WhyFeature3Description { get; set; } = null!;

    public string WhyFeature4Title { get; set; } = null!;

    public string WhyFeature4Description { get; set; } = null!;

    public string CtaTitle { get; set; } = null!;

    public string CtaSubtitle { get; set; } = null!;

    public string CtaButtonText { get; set; } = null!;

    public string? LogoUrl { get; set; }

    public string? HeroImageUrl { get; set; }

    public DateTime UpdatedAt { get; set; }

    public int? TenantId { get; set; }

    public virtual Tenant? Tenant { get; set; }
}
