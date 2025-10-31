namespace MechanicShopAPI.Models;

/// <summary>
/// Refresh token for JWT rotation and revocation
/// </summary>
public class RefreshToken
{
    public int Id { get; set; }

    /// <summary>
    /// The refresh token value (hashed)
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// User this token belongs to
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// When the token was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the token expires
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Whether this token has been revoked
    /// </summary>
    public bool IsRevoked { get; set; }

    /// <summary>
    /// When the token was revoked
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// Why the token was revoked (logout, security, etc.)
    /// </summary>
    public string? RevocationReason { get; set; }

    /// <summary>
    /// Token that replaced this one (for rotation tracking)
    /// </summary>
    public string? ReplacedByToken { get; set; }

    /// <summary>
    /// IP address that created this token
    /// </summary>
    public string? CreatedByIp { get; set; }

    /// <summary>
    /// IP address that revoked this token
    /// </summary>
    public string? RevokedByIp { get; set; }

    /// <summary>
    /// Navigation property to user
    /// </summary>
    public ApplicationUser User { get; set; } = null!;

    /// <summary>
    /// Check if token is active (not expired and not revoked)
    /// </summary>
    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;
}
