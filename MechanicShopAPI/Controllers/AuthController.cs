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
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtService _jwtService;
    private readonly MechanicShopContext _context;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtService jwtService,
        MechanicShopContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _context = context;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        // Check if user exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { error = "A user with this email already exists" });
        }

        // If StaffId is provided, verify it exists and isn't already linked
        if (request.StaffId.HasValue)
        {
            var staff = await _context.Staff.FindAsync(request.StaffId.Value);
            if (staff == null)
            {
                return BadRequest(new { error = "Staff member not found" });
            }

            var existingStaffUser = await _context.Users
                .FirstOrDefaultAsync(u => u.StaffId == request.StaffId.Value);
            if (existingStaffUser != null)
            {
                return BadRequest(new { error = "This staff member is already linked to a user account" });
            }
        }

        // Create user
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            StaffId = request.StaffId,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        // For new shop owner registrations, create a Staff record automatically
        // This allows them to go through the onboarding wizard
        if (!user.StaffId.HasValue)
        {
            var staff = new Staff
            {
                FirstName = request.Email.Split('@')[0], // Temporary, will be updated in onboarding
                LastName = "", // Will be updated in onboarding
                Email = request.Email,
                Status = StaffStatus.Active,
                CreatedAt = DateTime.UtcNow
                // TenantId and Role will be set during onboarding
            };

            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();

            // Link the staff record to the user
            user.StaffId = staff.Id;
            await _userManager.UpdateAsync(user);
        }

        // Generate tokens
        var accessToken = await _jwtService.GenerateAccessToken(user);
        var refreshToken = await _jwtService.GenerateRefreshToken(user, GetIpAddress());

        // Set refresh token in HTTP-only cookie
        SetRefreshTokenCookie(refreshToken.Token);

        // Load staff info if linked
        if (user.StaffId.HasValue)
        {
            await _context.Entry(user)
                .Reference(u => u.Staff)
                .LoadAsync();
        }

        return Ok(await BuildAuthResponse(user, accessToken));
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { error = "Invalid email or password" });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return Unauthorized(new { error = "Account is locked out due to multiple failed login attempts" });
            }
            return Unauthorized(new { error = "Invalid email or password" });
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Generate tokens
        var accessToken = await _jwtService.GenerateAccessToken(user);
        var refreshToken = await _jwtService.GenerateRefreshToken(user, GetIpAddress());

        // Set refresh token in HTTP-only cookie
        SetRefreshTokenCookie(refreshToken.Token);

        // Load staff info if linked
        if (user.StaffId.HasValue)
        {
            await _context.Entry(user)
                .Reference(u => u.Staff)
                .Query()
                .Include(s => s.Tenant)
                .LoadAsync();
        }

        return Ok(await BuildAuthResponse(user, accessToken));
    }

    /// <summary>
    /// Refresh access token using refresh token from cookie
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { error = "Refresh token not found" });
        }

        var (user, oldRefreshToken) = await _jwtService.ValidateRefreshToken(refreshToken);
        if (user == null || oldRefreshToken == null)
        {
            return Unauthorized(new { error = "Invalid or expired refresh token" });
        }

        // Generate new tokens
        var newAccessToken = await _jwtService.GenerateAccessToken(user);
        var newRefreshToken = await _jwtService.GenerateRefreshToken(user, GetIpAddress());

        // Revoke old refresh token (rotation)
        oldRefreshToken.ReplacedByToken = newRefreshToken.Token;
        await _jwtService.RevokeRefreshToken(oldRefreshToken, GetIpAddress(), "Replaced by new token");

        // Set new refresh token in cookie
        SetRefreshTokenCookie(newRefreshToken.Token);

        // Load staff info if linked
        if (user.StaffId.HasValue)
        {
            await _context.Entry(user)
                .Reference(u => u.Staff)
                .Query()
                .Include(s => s.Tenant)
                .LoadAsync();
        }

        return Ok(await BuildAuthResponse(user, newAccessToken));
    }

    /// <summary>
    /// Logout and revoke refresh token
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            var (user, token) = await _jwtService.ValidateRefreshToken(refreshToken);
            if (token != null)
            {
                await _jwtService.RevokeRefreshToken(token, GetIpAddress(), "User logout");
            }
        }

        // Clear refresh token cookie
        Response.Cookies.Delete("refreshToken");

        return Ok(new { message = "Logged out successfully" });
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfo>> GetCurrentUser()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null)
        {
            return Unauthorized();
        }

        var user = await _userManager.Users
            .Include(u => u.Staff)
                .ThenInclude(s => s!.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(await BuildUserInfo(user));
    }

    // Helper methods

    private async Task<AuthResponse> BuildAuthResponse(ApplicationUser user, string accessToken)
    {
        var expirationMinutes = int.Parse(HttpContext.RequestServices
            .GetRequiredService<IConfiguration>()["JwtSettings:AccessTokenExpirationMinutes"] ?? "15");

        return new AuthResponse
        {
            AccessToken = accessToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
            User = await BuildUserInfo(user)
        };
    }

    private Task<UserInfo> BuildUserInfo(ApplicationUser user)
    {
        var userInfo = new UserInfo
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty
        };

        if (user.StaffId.HasValue && user.Staff != null)
        {
            userInfo.Staff = new StaffInfo
            {
                Id = user.Staff.Id,
                FirstName = user.Staff.FirstName,
                LastName = user.Staff.LastName,
                Role = user.Staff.Role.ToString(),
                Status = user.Staff.Status.ToString(),
                TenantId = user.Staff.TenantId,
                TenantSlug = user.Staff.Tenant?.Slug ?? string.Empty,
                TenantName = user.Staff.Tenant?.Name ?? string.Empty
            };
        }

        return Task.FromResult(userInfo);
    }

    private void SetRefreshTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // HTTPS only in production
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", token, cookieOptions);
    }

    private string GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            return Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();
        }
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
