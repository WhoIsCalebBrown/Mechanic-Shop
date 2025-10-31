using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MechanicShopAPI.Data;
using MechanicShopAPI.DTOs;
using MechanicShopAPI.Models;
using MechanicShopAPI.Services;

namespace MechanicShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Must be authenticated to onboard
public class OnboardingController : ControllerBase
{
    private readonly MechanicShopContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ISlugService _slugService;
    private readonly ILogger<OnboardingController> _logger;
    private readonly IConfiguration _configuration;

    public OnboardingController(
        MechanicShopContext context,
        UserManager<ApplicationUser> userManager,
        ISlugService slugService,
        ILogger<OnboardingController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _userManager = userManager;
        _slugService = slugService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Get current onboarding status
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<OnboardingStatusResponse>> GetStatus()
    {
        var userId = _userManager.GetUserId(User);
        var user = await _userManager.Users
            .Include(u => u.Staff)
                .ThenInclude(s => s!.Tenant)
                    .ThenInclude(t => t.ServiceItems)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Staff?.Tenant == null)
        {
            return Ok(new OnboardingStatusResponse
            {
                IsCompleted = false,
                CurrentStep = 0,
                Tenant = null
            });
        }

        var tenant = user.Staff.Tenant;
        var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";

        return Ok(new OnboardingStatusResponse
        {
            IsCompleted = tenant.OnboardingCompleted,
            CurrentStep = tenant.OnboardingStep,
            CompletedAt = tenant.OnboardingCompletedAt,
            Tenant = new TenantSummary
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                BookingEnabled = tenant.BookingEnabled,
                ServiceItemCount = tenant.ServiceItems.Count
            },
            PublicBookingUrl = tenant.BookingEnabled ? $"{baseUrl}/book/{tenant.Slug}" : null
        });
    }

    /// <summary>
    /// Check if a slug is available
    /// </summary>
    [HttpPost("check-slug")]
    public async Task<ActionResult<SlugCheckResponse>> CheckSlug([FromBody] SlugCheckRequest request)
    {
        var isAvailable = await _slugService.IsSlugAvailable(request.Slug);

        if (isAvailable)
        {
            return Ok(new SlugCheckResponse
            {
                IsAvailable = true,
                Message = "This slug is available!"
            });
        }

        var suggestions = await _slugService.SuggestAlternativeSlugs(request.Slug);

        return Ok(new SlugCheckResponse
        {
            IsAvailable = false,
            Message = "This slug is already taken.",
            SuggestedSlug = suggestions.FirstOrDefault()
        });
    }

    /// <summary>
    /// Generate a slug suggestion from business name
    /// </summary>
    [HttpGet("suggest-slug")]
    public async Task<ActionResult<SlugCheckResponse>> SuggestSlug([FromQuery] string businessName)
    {
        if (string.IsNullOrWhiteSpace(businessName))
        {
            return BadRequest(new { error = "Business name is required" });
        }

        var slug = await _slugService.GetUniqueSlug(businessName);

        return Ok(new SlugCheckResponse
        {
            IsAvailable = true,
            SuggestedSlug = slug
        });
    }

    /// <summary>
    /// Step 1: Save business information
    /// </summary>
    [HttpPost("step1")]
    public async Task<ActionResult<OnboardingStatusResponse>> Step1([FromBody] OnboardingStep1Request request)
    {
        var userId = _userManager.GetUserId(User);
        var user = await _userManager.Users
            .Include(u => u.Staff)
                .ThenInclude(s => s!.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Staff == null)
        {
            return BadRequest(new { error = "User must be linked to a staff member to onboard a tenant" });
        }

        Tenant? tenant = user.Staff.Tenant;

        // If no tenant exists, create one
        if (tenant == null)
        {
            // Generate or validate slug
            var slug = request.Slug ?? await _slugService.GetUniqueSlug(request.BusinessName);

            if (!await _slugService.IsSlugAvailable(slug))
            {
                return BadRequest(new { error = "Slug is already taken. Please choose a different one." });
            }

            tenant = new Tenant
            {
                Slug = slug,
                Name = request.BusinessName,
                BusinessAddress = request.BusinessAddress,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                Phone = request.Phone,
                Email = request.Email,
                Website = request.Website,
                Description = request.Description,
                Status = TenantStatus.Trial,
                TrialEndsAt = DateTime.UtcNow.AddDays(30),
                OnboardingStep = 1,
                CreatedBy = userId,
                MediaStoragePath = $"/tenants/{slug}/media"
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            // Link staff to new tenant
            user.Staff.TenantId = tenant.Id;
            user.Staff.Role = StaffRole.Owner; // First user is owner
            await _context.SaveChangesAsync();
        }
        else
        {
            // Update existing tenant
            var newSlug = request.Slug ?? tenant.Slug;
            if (newSlug != tenant.Slug)
            {
                if (!await _slugService.IsSlugAvailable(newSlug, tenant.Id))
                {
                    return BadRequest(new { error = "Slug is already taken. Please choose a different one." });
                }
                tenant.Slug = newSlug;
                tenant.MediaStoragePath = $"/tenants/{newSlug}/media";
            }

            tenant.Name = request.BusinessName;
            tenant.BusinessAddress = request.BusinessAddress;
            tenant.City = request.City;
            tenant.State = request.State;
            tenant.ZipCode = request.ZipCode;
            tenant.Phone = request.Phone;
            tenant.Email = request.Email;
            tenant.Website = request.Website;
            tenant.Description = request.Description;
            tenant.OnboardingStep = Math.Max(tenant.OnboardingStep, 1);
            tenant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";

        return Ok(new OnboardingStatusResponse
        {
            IsCompleted = false,
            CurrentStep = 1,
            Tenant = new TenantSummary
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                BookingEnabled = tenant.BookingEnabled,
                ServiceItemCount = 0
            },
            PublicBookingUrl = null
        });
    }

    /// <summary>
    /// Step 2: Save availability rules
    /// </summary>
    [HttpPost("step2")]
    public async Task<ActionResult<OnboardingStatusResponse>> Step2([FromBody] OnboardingStep2Request request)
    {
        var tenant = await GetUserTenant();
        if (tenant == null)
        {
            return BadRequest(new { error = "Complete step 1 first" });
        }

        // Validate availability rules
        if (!ValidateAvailabilityRules(request.AvailabilityRules, out var validationError))
        {
            return BadRequest(new { error = validationError });
        }

        // Serialize to JSON
        tenant.AvailabilityRules = JsonSerializer.Serialize(request.AvailabilityRules);
        tenant.OnboardingStep = Math.Max(tenant.OnboardingStep, 2);
        tenant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";

        return Ok(new OnboardingStatusResponse
        {
            IsCompleted = false,
            CurrentStep = 2,
            Tenant = new TenantSummary
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                BookingEnabled = tenant.BookingEnabled,
                ServiceItemCount = tenant.ServiceItems.Count
            },
            PublicBookingUrl = null
        });
    }

    /// <summary>
    /// Step 3: Add first service item and complete onboarding
    /// </summary>
    [HttpPost("step3")]
    public async Task<ActionResult<OnboardingStatusResponse>> Step3([FromBody] OnboardingStep3Request request)
    {
        var tenant = await GetUserTenant(includeServiceItems: true);
        if (tenant == null)
        {
            return BadRequest(new { error = "Complete step 1 first" });
        }

        if (string.IsNullOrEmpty(tenant.AvailabilityRules))
        {
            return BadRequest(new { error = "Complete step 2 first (set availability rules)" });
        }

        // Create first service item
        var serviceItem = new ServiceItem
        {
            TenantId = tenant.Id,
            Name = request.ServiceName,
            Description = request.ServiceDescription,
            BasePrice = request.BasePrice,
            DurationMinutes = request.DurationMinutes,
            Category = request.Category,
            IsActive = true,
            IsBookableOnline = true
        };

        _context.ServiceItems.Add(serviceItem);

        // Mark onboarding as complete and enable booking
        tenant.OnboardingStep = 3;
        tenant.OnboardingCompleted = true;
        tenant.OnboardingCompletedAt = DateTime.UtcNow;
        tenant.BookingEnabled = true;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";

        return Ok(new OnboardingStatusResponse
        {
            IsCompleted = true,
            CurrentStep = 3,
            CompletedAt = tenant.OnboardingCompletedAt,
            Tenant = new TenantSummary
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                BookingEnabled = tenant.BookingEnabled,
                ServiceItemCount = 1
            },
            PublicBookingUrl = $"{baseUrl}/book/{tenant.Slug}"
        });
    }

    /// <summary>
    /// Complete all onboarding steps in one request
    /// </summary>
    [HttpPost("complete")]
    public async Task<ActionResult<OnboardingStatusResponse>> CompleteOnboarding([FromBody] CompleteOnboardingRequest request)
    {
        // Step 1
        var step1Result = await Step1(request.BusinessInfo);
        if (step1Result.Result is BadRequestObjectResult)
        {
            return step1Result.Result;
        }

        // Step 2
        var step2Result = await Step2(request.Availability);
        if (step2Result.Result is BadRequestObjectResult)
        {
            return step2Result.Result;
        }

        // Step 3
        return await Step3(request.FirstService);
    }

    // Helper methods

    private async Task<Tenant?> GetUserTenant(bool includeServiceItems = false)
    {
        var userId = _userManager.GetUserId(User);

        ApplicationUser? user;
        if (includeServiceItems)
        {
            user = await _userManager.Users
                .Include(u => u.Staff)
                    .ThenInclude(s => s!.Tenant)
                        .ThenInclude(t => t.ServiceItems)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
        else
        {
            user = await _userManager.Users
                .Include(u => u.Staff)
                    .ThenInclude(s => s!.Tenant)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        return user?.Staff?.Tenant;
    }

    private bool ValidateAvailabilityRules(AvailabilityRules rules, out string? error)
    {
        error = null;

        if (rules.SlotDurationMinutes < 15 || rules.SlotDurationMinutes > 240)
        {
            error = "Slot duration must be between 15 and 240 minutes";
            return false;
        }

        if (rules.MaxAdvanceBookingDays < 1 || rules.MaxAdvanceBookingDays > 365)
        {
            error = "Max advance booking must be between 1 and 365 days";
            return false;
        }

        if (rules.MinAdvanceBookingHours < 0 || rules.MinAdvanceBookingHours > 168)
        {
            error = "Min advance booking must be between 0 and 168 hours (1 week)";
            return false;
        }

        // Validate time formats
        foreach (var schedule in rules.WeeklySchedule.Values)
        {
            if (schedule == null || !schedule.IsOpen) continue;

            if (!IsValidTimeFormat(schedule.OpenTime) || !IsValidTimeFormat(schedule.CloseTime))
            {
                error = "Invalid time format. Use HH:mm (e.g., 08:00)";
                return false;
            }
        }

        return true;
    }

    private bool IsValidTimeFormat(string? time)
    {
        if (string.IsNullOrEmpty(time)) return false;
        return TimeSpan.TryParseExact(time, @"hh\:mm", null, out _);
    }
}
