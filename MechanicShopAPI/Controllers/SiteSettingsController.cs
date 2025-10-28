using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.Models;
using MechanicShopAPI.DTOs;

namespace MechanicShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SiteSettingsController : ControllerBase
{
    private readonly MechanicShopContext _context;

    public SiteSettingsController(MechanicShopContext context)
    {
        _context = context;
    }

    // GET: api/sitesettings
    [HttpGet]
    public async Task<ActionResult<SiteSettingsDto>> GetSiteSettings()
    {
        var settings = await _context.SiteSettings.FirstOrDefaultAsync();

        // If no settings exist, create default settings
        if (settings == null)
        {
            settings = new SiteSettings();
            _context.SiteSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(MapToDto(settings));
    }

    // PUT: api/sitesettings
    [HttpPut]
    public async Task<ActionResult<SiteSettingsDto>> UpdateSiteSettings(UpdateSiteSettingsDto updateDto)
    {
        var settings = await _context.SiteSettings.FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new SiteSettings();
            _context.SiteSettings.Add(settings);
        }

        // Update only non-null properties
        if (updateDto.BusinessName != null) settings.BusinessName = updateDto.BusinessName;
        if (updateDto.Tagline != null) settings.Tagline = updateDto.Tagline;
        if (updateDto.Address != null) settings.Address = updateDto.Address;
        if (updateDto.City != null) settings.City = updateDto.City;
        if (updateDto.State != null) settings.State = updateDto.State;
        if (updateDto.ZipCode != null) settings.ZipCode = updateDto.ZipCode;
        if (updateDto.Phone != null) settings.Phone = updateDto.Phone;
        if (updateDto.Email != null) settings.Email = updateDto.Email;

        if (updateDto.MondayFridayHours != null) settings.MondayFridayHours = updateDto.MondayFridayHours;
        if (updateDto.SaturdayHours != null) settings.SaturdayHours = updateDto.SaturdayHours;
        if (updateDto.SundayHours != null) settings.SundayHours = updateDto.SundayHours;

        if (updateDto.VehiclesServiced.HasValue) settings.VehiclesServiced = updateDto.VehiclesServiced.Value;
        if (updateDto.SatisfactionRate.HasValue) settings.SatisfactionRate = updateDto.SatisfactionRate.Value;
        if (updateDto.YearsExperience.HasValue) settings.YearsExperience = updateDto.YearsExperience.Value;

        if (updateDto.HeroTitle != null) settings.HeroTitle = updateDto.HeroTitle;
        if (updateDto.HeroSubtitle != null) settings.HeroSubtitle = updateDto.HeroSubtitle;
        if (updateDto.PrimaryCtaText != null) settings.PrimaryCtaText = updateDto.PrimaryCtaText;
        if (updateDto.SecondaryCtaText != null) settings.SecondaryCtaText = updateDto.SecondaryCtaText;

        if (updateDto.Service1Title != null) settings.Service1Title = updateDto.Service1Title;
        if (updateDto.Service1Description != null) settings.Service1Description = updateDto.Service1Description;
        if (updateDto.Service1Feature1 != null) settings.Service1Feature1 = updateDto.Service1Feature1;
        if (updateDto.Service1Feature2 != null) settings.Service1Feature2 = updateDto.Service1Feature2;
        if (updateDto.Service1Feature3 != null) settings.Service1Feature3 = updateDto.Service1Feature3;
        if (updateDto.Service1Feature4 != null) settings.Service1Feature4 = updateDto.Service1Feature4;
        if (updateDto.Service1ImageUrl != null) settings.Service1ImageUrl = updateDto.Service1ImageUrl;

        if (updateDto.Service2Title != null) settings.Service2Title = updateDto.Service2Title;
        if (updateDto.Service2Description != null) settings.Service2Description = updateDto.Service2Description;
        if (updateDto.Service2Feature1 != null) settings.Service2Feature1 = updateDto.Service2Feature1;
        if (updateDto.Service2Feature2 != null) settings.Service2Feature2 = updateDto.Service2Feature2;
        if (updateDto.Service2Feature3 != null) settings.Service2Feature3 = updateDto.Service2Feature3;
        if (updateDto.Service2Feature4 != null) settings.Service2Feature4 = updateDto.Service2Feature4;
        if (updateDto.Service2ImageUrl != null) settings.Service2ImageUrl = updateDto.Service2ImageUrl;

        if (updateDto.Service3Title != null) settings.Service3Title = updateDto.Service3Title;
        if (updateDto.Service3Description != null) settings.Service3Description = updateDto.Service3Description;
        if (updateDto.Service3Feature1 != null) settings.Service3Feature1 = updateDto.Service3Feature1;
        if (updateDto.Service3Feature2 != null) settings.Service3Feature2 = updateDto.Service3Feature2;
        if (updateDto.Service3Feature3 != null) settings.Service3Feature3 = updateDto.Service3Feature3;
        if (updateDto.Service3Feature4 != null) settings.Service3Feature4 = updateDto.Service3Feature4;
        if (updateDto.Service3ImageUrl != null) settings.Service3ImageUrl = updateDto.Service3ImageUrl;

        if (updateDto.WhyFeature1Title != null) settings.WhyFeature1Title = updateDto.WhyFeature1Title;
        if (updateDto.WhyFeature1Description != null) settings.WhyFeature1Description = updateDto.WhyFeature1Description;
        if (updateDto.WhyFeature2Title != null) settings.WhyFeature2Title = updateDto.WhyFeature2Title;
        if (updateDto.WhyFeature2Description != null) settings.WhyFeature2Description = updateDto.WhyFeature2Description;
        if (updateDto.WhyFeature3Title != null) settings.WhyFeature3Title = updateDto.WhyFeature3Title;
        if (updateDto.WhyFeature3Description != null) settings.WhyFeature3Description = updateDto.WhyFeature3Description;
        if (updateDto.WhyFeature4Title != null) settings.WhyFeature4Title = updateDto.WhyFeature4Title;
        if (updateDto.WhyFeature4Description != null) settings.WhyFeature4Description = updateDto.WhyFeature4Description;

        if (updateDto.CtaTitle != null) settings.CtaTitle = updateDto.CtaTitle;
        if (updateDto.CtaSubtitle != null) settings.CtaSubtitle = updateDto.CtaSubtitle;
        if (updateDto.CtaButtonText != null) settings.CtaButtonText = updateDto.CtaButtonText;

        if (updateDto.LogoUrl != null) settings.LogoUrl = updateDto.LogoUrl;
        if (updateDto.HeroImageUrl != null) settings.HeroImageUrl = updateDto.HeroImageUrl;

        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(settings));
    }

    // Helper method to map entity to DTO
    private static SiteSettingsDto MapToDto(SiteSettings settings)
    {
        return new SiteSettingsDto
        {
            Id = settings.Id,
            BusinessName = settings.BusinessName,
            Tagline = settings.Tagline,
            Address = settings.Address,
            City = settings.City,
            State = settings.State,
            ZipCode = settings.ZipCode,
            Phone = settings.Phone,
            Email = settings.Email,
            MondayFridayHours = settings.MondayFridayHours,
            SaturdayHours = settings.SaturdayHours,
            SundayHours = settings.SundayHours,
            VehiclesServiced = settings.VehiclesServiced,
            SatisfactionRate = settings.SatisfactionRate,
            YearsExperience = settings.YearsExperience,
            HeroTitle = settings.HeroTitle,
            HeroSubtitle = settings.HeroSubtitle,
            PrimaryCtaText = settings.PrimaryCtaText,
            SecondaryCtaText = settings.SecondaryCtaText,
            Service1Title = settings.Service1Title,
            Service1Description = settings.Service1Description,
            Service1Feature1 = settings.Service1Feature1,
            Service1Feature2 = settings.Service1Feature2,
            Service1Feature3 = settings.Service1Feature3,
            Service1Feature4 = settings.Service1Feature4,
            Service1ImageUrl = settings.Service1ImageUrl,
            Service2Title = settings.Service2Title,
            Service2Description = settings.Service2Description,
            Service2Feature1 = settings.Service2Feature1,
            Service2Feature2 = settings.Service2Feature2,
            Service2Feature3 = settings.Service2Feature3,
            Service2Feature4 = settings.Service2Feature4,
            Service2ImageUrl = settings.Service2ImageUrl,
            Service3Title = settings.Service3Title,
            Service3Description = settings.Service3Description,
            Service3Feature1 = settings.Service3Feature1,
            Service3Feature2 = settings.Service3Feature2,
            Service3Feature3 = settings.Service3Feature3,
            Service3Feature4 = settings.Service3Feature4,
            Service3ImageUrl = settings.Service3ImageUrl,
            WhyFeature1Title = settings.WhyFeature1Title,
            WhyFeature1Description = settings.WhyFeature1Description,
            WhyFeature2Title = settings.WhyFeature2Title,
            WhyFeature2Description = settings.WhyFeature2Description,
            WhyFeature3Title = settings.WhyFeature3Title,
            WhyFeature3Description = settings.WhyFeature3Description,
            WhyFeature4Title = settings.WhyFeature4Title,
            WhyFeature4Description = settings.WhyFeature4Description,
            CtaTitle = settings.CtaTitle,
            CtaSubtitle = settings.CtaSubtitle,
            CtaButtonText = settings.CtaButtonText,
            LogoUrl = settings.LogoUrl,
            HeroImageUrl = settings.HeroImageUrl,
            UpdatedAt = settings.UpdatedAt
        };
    }
}
