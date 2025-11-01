using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MechanicShopAPI.Authorization;
using MechanicShopAPI.Data;
using MechanicShopAPI.Middleware;
using MechanicShopAPI.Models;
using MechanicShopAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add multi-tenancy services (Singleton because it uses AsyncLocal for request context)
builder.Services.AddSingleton<ITenantAccessor, TenantAccessor>();

// Add JWT service
builder.Services.AddScoped<IJwtService, JwtService>();

// Add slug service
builder.Services.AddScoped<ISlugService, SlugService>();

// Configure PostgreSQL Database
builder.Services.AddDbContext<MechanicShopContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));

// Configure ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 4;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false; // Set to true in production with email service
})
.AddEntityFrameworkStores<MechanicShopContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JWT secret key not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Set to true in production
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Register authorization handlers
builder.Services.AddScoped<IAuthorizationHandler, RoleRequirementHandler>();
builder.Services.AddScoped<IAuthorizationHandler, TenantRequirementHandler>();
builder.Services.AddScoped<IAuthorizationHandler, StaffStatusRequirementHandler>();

// Configure authorization policies
builder.Services.AddAuthorization(options =>
{
    // Policy: User must be linked to staff and be active
    options.AddPolicy("RequireStaff", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.Requirements.Add(new TenantRequirement());
        policy.Requirements.Add(new StaffStatusRequirement(StaffStatus.Active));
    });

    // Policy: Owner only
    options.AddPolicy("RequireOwner", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.Requirements.Add(new RoleRequirement(StaffRole.Owner));
        policy.Requirements.Add(new StaffStatusRequirement(StaffStatus.Active));
    });

    // Policy: Owner or Manager
    options.AddPolicy("RequireManagement", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.Requirements.Add(new RoleRequirement(StaffRole.Owner, StaffRole.Manager));
        policy.Requirements.Add(new StaffStatusRequirement(StaffStatus.Active));
    });

    // Policy: Owner, Manager, or Dispatcher
    options.AddPolicy("RequireDispatcher", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.Requirements.Add(new RoleRequirement(StaffRole.Owner, StaffRole.Manager, StaffRole.Dispatcher));
        policy.Requirements.Add(new StaffStatusRequirement(StaffStatus.Active));
    });

    // Policy: Technician or higher
    options.AddPolicy("RequireTechnician", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.Requirements.Add(new RoleRequirement(
            StaffRole.Owner,
            StaffRole.Manager,
            StaffRole.Dispatcher,
            StaffRole.Technician,
            StaffRole.Advisor));
        policy.Requirements.Add(new StaffStatusRequirement(StaffStatus.Active));
    });
});

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle circular references
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Optional: preserve null values
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        // Convert enums to/from strings instead of numbers (e.g., "Scheduled" instead of 0)
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Required for HTTP-only cookies
        });
});

var app = builder.Build();

// Automatically apply migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MechanicShopContext>();
    db.Database.EnsureCreated(); // This will create the database and all tables
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable static files for the booking preview page
app.UseStaticFiles();

app.UseCors("AllowReactApp");

// Add rate limiting middleware (before authentication)
app.UseRateLimiting();

// Authentication must come before tenant resolution (so JWT claims are available)
app.UseAuthentication();

// Add tenant resolution middleware (after authentication, before authorization)
app.UseTenantResolution();

// Authorization must come last
app.UseAuthorization();

app.MapControllers();

app.Run();
