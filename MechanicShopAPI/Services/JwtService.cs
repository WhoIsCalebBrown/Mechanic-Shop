using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MechanicShopAPI.Data;
using MechanicShopAPI.Models;

namespace MechanicShopAPI.Services;

public interface IJwtService
{
    Task<string> GenerateAccessToken(ApplicationUser user);
    Task<RefreshToken> GenerateRefreshToken(ApplicationUser user, string ipAddress);
    Task<(ApplicationUser? user, RefreshToken? refreshToken)> ValidateRefreshToken(string token);
    Task RevokeRefreshToken(RefreshToken token, string ipAddress, string reason);
    Task RemoveExpiredRefreshTokens(string userId);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;
    private readonly MechanicShopContext _context;

    public JwtService(IConfiguration configuration, MechanicShopContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public async Task<string> GenerateAccessToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        // If user is linked to a staff member, add staff claims
        if (user.StaffId.HasValue)
        {
            var staff = await _context.Staff
                .Include(s => s.Tenant)
                .FirstOrDefaultAsync(s => s.Id == user.StaffId.Value);

            if (staff != null)
            {
                claims.Add(new Claim("staff_id", staff.Id.ToString()));
                claims.Add(new Claim("staff_role", staff.Role.ToString()));
                claims.Add(new Claim("staff_status", staff.Status.ToString()));
                claims.Add(new Claim("tenant_id", staff.TenantId.ToString()));
                claims.Add(new Claim("tenant_slug", staff.Tenant.Slug));
            }
        }

        var secretKey = _configuration["JwtSettings:SecretKey"]
            ?? throw new InvalidOperationException("JWT secret key not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expirationMinutes = int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "15");
        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<RefreshToken> GenerateRefreshToken(ApplicationUser user, string ipAddress)
    {
        // Generate cryptographically secure random token
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var tokenString = Convert.ToBase64String(randomBytes);

        var expirationDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");
        var refreshToken = new RefreshToken
        {
            Token = tokenString,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            CreatedByIp = ipAddress
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        // Clean up old expired tokens
        await RemoveExpiredRefreshTokens(user.Id);

        return refreshToken;
    }

    public async Task<(ApplicationUser? user, RefreshToken? refreshToken)> ValidateRefreshToken(string token)
    {
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.Staff)
            .FirstOrDefaultAsync(rt => rt.Token == token);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            return (null, null);
        }

        return (refreshToken.User, refreshToken);
    }

    public async Task RevokeRefreshToken(RefreshToken token, string ipAddress, string reason)
    {
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = ipAddress;
        token.RevocationReason = reason;

        _context.RefreshTokens.Update(token);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveExpiredRefreshTokens(string userId)
    {
        var expiredTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();

        _context.RefreshTokens.RemoveRange(expiredTokens);
        await _context.SaveChangesAsync();
    }
}
