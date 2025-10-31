using Microsoft.AspNetCore.Identity;

namespace MechanicShopAPI.Models;

/// <summary>
/// Extended Identity user with link to Staff member
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Link to Staff entity - allows staff member to authenticate
    /// </summary>
    public int? StaffId { get; set; }

    /// <summary>
    /// Navigation property to Staff
    /// </summary>
    public Staff? Staff { get; set; }

    /// <summary>
    /// When the user account was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Last time the user logged in
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Collection of refresh tokens for this user
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
