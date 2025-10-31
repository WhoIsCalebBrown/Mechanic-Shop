using System.Collections.Concurrent;

namespace MechanicShopAPI.Middleware;

/// <summary>
/// Simple in-memory rate limiting middleware for auth endpoints
/// For production, consider using distributed cache (Redis) for multi-instance deployments
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;

    // Store request counts: Key = IP+Endpoint, Value = (Count, ResetTime)
    private static readonly ConcurrentDictionary<string, (int count, DateTime resetTime)> _requestCounts = new();

    // Cleanup timer to remove expired entries
    private static readonly Timer _cleanupTimer = new(CleanupExpiredEntries, null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(1));

    // Rate limit configuration
    private const int MaxRequestsPerWindow = 10; // Max requests per IP per endpoint
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(5); // Time window

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only apply rate limiting to auth endpoints
        var path = context.Request.Path.Value?.ToLower();
        if (path == null || !IsAuthEndpoint(path))
        {
            await _next(context);
            return;
        }

        var ipAddress = GetClientIpAddress(context);
        var key = $"{ipAddress}:{path}";
        var now = DateTime.UtcNow;

        var (count, resetTime) = _requestCounts.GetOrAdd(key, _ => (0, now.Add(Window)));

        // Reset if window has expired
        if (now >= resetTime)
        {
            count = 0;
            resetTime = now.Add(Window);
        }

        // Increment count
        count++;
        _requestCounts[key] = (count, resetTime);

        // Check if rate limit exceeded
        if (count > MaxRequestsPerWindow)
        {
            var retryAfter = (int)(resetTime - now).TotalSeconds;
            context.Response.StatusCode = 429; // Too Many Requests
            context.Response.Headers.Append("Retry-After", retryAfter.ToString());
            context.Response.Headers.Append("X-RateLimit-Limit", MaxRequestsPerWindow.ToString());
            context.Response.Headers.Append("X-RateLimit-Remaining", "0");
            context.Response.Headers.Append("X-RateLimit-Reset", new DateTimeOffset(resetTime).ToUnixTimeSeconds().ToString());

            _logger.LogWarning("Rate limit exceeded for IP {IpAddress} on endpoint {Endpoint}", ipAddress, path);

            await context.Response.WriteAsJsonAsync(new
            {
                error = "Rate limit exceeded. Please try again later.",
                retryAfter = retryAfter
            });
            return;
        }

        // Add rate limit headers
        var remaining = Math.Max(0, MaxRequestsPerWindow - count);
        context.Response.Headers.Append("X-RateLimit-Limit", MaxRequestsPerWindow.ToString());
        context.Response.Headers.Append("X-RateLimit-Remaining", remaining.ToString());
        context.Response.Headers.Append("X-RateLimit-Reset", new DateTimeOffset(resetTime).ToUnixTimeSeconds().ToString());

        await _next(context);
    }

    private static bool IsAuthEndpoint(string path)
    {
        return path.StartsWith("/api/auth/register") ||
               path.StartsWith("/api/auth/login") ||
               path.StartsWith("/api/auth/refresh");
    }

    private static string GetClientIpAddress(HttpContext context)
    {
        // Check for forwarded IP (if behind proxy/load balancer)
        if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            return context.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private static void CleanupExpiredEntries(object? state)
    {
        var now = DateTime.UtcNow;
        var expiredKeys = _requestCounts
            .Where(kvp => now >= kvp.Value.resetTime.Add(TimeSpan.FromMinutes(5)))
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
        {
            _requestCounts.TryRemove(key, out _);
        }
    }
}

public static class RateLimitingMiddlewareExtensions
{
    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RateLimitingMiddleware>();
    }
}
