using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;

namespace MechanicShopAPI.Services;

public interface ISlugService
{
    /// <summary>
    /// Generate a URL-safe slug from business name
    /// </summary>
    string GenerateSlug(string input);

    /// <summary>
    /// Check if slug is available (not taken by another tenant)
    /// </summary>
    Task<bool> IsSlugAvailable(string slug, int? excludeTenantId = null);

    /// <summary>
    /// Get a unique slug, adding numbers if needed
    /// </summary>
    Task<string> GetUniqueSlug(string baseSlug, int? excludeTenantId = null);

    /// <summary>
    /// Validate slug format
    /// </summary>
    bool IsValidSlug(string slug);

    /// <summary>
    /// Suggest alternative slugs if the desired one is taken
    /// </summary>
    Task<List<string>> SuggestAlternativeSlugs(string slug, int count = 3);
}

public class SlugService : ISlugService
{
    private readonly MechanicShopContext _context;
    private const int MinLength = 3;
    private const int MaxLength = 30;
    private static readonly Regex SlugRegex = new(@"^[a-z0-9-]+$", RegexOptions.Compiled);

    public SlugService(MechanicShopContext context)
    {
        _context = context;
    }

    public string GenerateSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return "shop-" + Guid.NewGuid().ToString()[..8];
        }

        // Convert to lowercase
        var slug = input.ToLowerInvariant();

        // Remove special characters and replace spaces with hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-"); // Remove consecutive hyphens
        slug = slug.Trim('-'); // Remove leading/trailing hyphens

        // Ensure minimum length
        if (slug.Length < MinLength)
        {
            slug += "-shop";
        }

        // Truncate if too long
        if (slug.Length > MaxLength)
        {
            slug = slug[..MaxLength].TrimEnd('-');
        }

        return slug;
    }

    public async Task<bool> IsSlugAvailable(string slug, int? excludeTenantId = null)
    {
        if (!IsValidSlug(slug))
        {
            return false;
        }

        var query = _context.Tenants.Where(t => t.Slug.ToLower() == slug.ToLower());

        if (excludeTenantId.HasValue)
        {
            query = query.Where(t => t.Id != excludeTenantId.Value);
        }

        return !await query.AnyAsync();
    }

    public async Task<string> GetUniqueSlug(string baseSlug, int? excludeTenantId = null)
    {
        var slug = GenerateSlug(baseSlug);

        if (await IsSlugAvailable(slug, excludeTenantId))
        {
            return slug;
        }

        // Try adding numbers
        for (int i = 2; i <= 100; i++)
        {
            var numberedSlug = $"{slug}-{i}";
            if (numberedSlug.Length <= MaxLength && await IsSlugAvailable(numberedSlug, excludeTenantId))
            {
                return numberedSlug;
            }
        }

        // If still not unique, add random suffix
        return $"{slug[..(MaxLength - 9)]}-{Guid.NewGuid().ToString()[..8]}";
    }

    public bool IsValidSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return false;
        }

        if (slug.Length < MinLength || slug.Length > MaxLength)
        {
            return false;
        }

        return SlugRegex.IsMatch(slug);
    }

    public async Task<List<string>> SuggestAlternativeSlugs(string slug, int count = 3)
    {
        var suggestions = new List<string>();
        var baseSlug = GenerateSlug(slug);

        // Add numbered variations
        for (int i = 2; i <= count + 1; i++)
        {
            var suggestion = $"{baseSlug}-{i}";
            if (suggestion.Length <= MaxLength && await IsSlugAvailable(suggestion))
            {
                suggestions.Add(suggestion);
                if (suggestions.Count >= count)
                {
                    break;
                }
            }
        }

        // Add location-based suggestions if we don't have enough
        if (suggestions.Count < count)
        {
            var locationSuffixes = new[] { "auto", "motors", "garage", "service" };
            foreach (var suffix in locationSuffixes)
            {
                var suggestion = $"{baseSlug}-{suffix}";
                if (suggestion.Length <= MaxLength && await IsSlugAvailable(suggestion))
                {
                    suggestions.Add(suggestion);
                    if (suggestions.Count >= count)
                    {
                        break;
                    }
                }
            }
        }

        return suggestions;
    }
}
