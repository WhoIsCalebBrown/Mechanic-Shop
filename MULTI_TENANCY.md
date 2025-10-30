# Multi-Tenancy Infrastructure

## Overview

The Mechanic Shop API now supports multi-tenancy with complete data isolation between tenants. Each tenant has their own isolated data for customers, vehicles, appointments, and service records.

## Architecture

### Components

1. **Tenant Model** (`Models/Tenant.cs`)
   - Business profile fields (name, address, contact info)
   - Plan management (Free, Basic, Professional, Enterprise)
   - Status tracking (Active, Trial, Suspended, Cancelled, Expired)
   - Integration settings (stored as JSON)
   - Resource limits (storage, users, customers, vehicles)

2. **ITenantAccessor Service** (`Services/ITenantAccessor.cs`)
   - Provides ambient tenant context using AsyncLocal
   - Thread-safe tenant resolution
   - Used by DbContext for query filtering

3. **Tenant Resolution Middleware** (`Middleware/TenantResolutionMiddleware.cs`)
   - Resolves tenant from multiple sources (priority order):
     1. JWT claim (`tenant_id` or `tenant_slug`)
     2. Route parameter (`{tenantSlug}`)
     3. HTTP header (`X-Tenant-Slug`)
     4. Subdomain (e.g., `precision-auto.example.com`)

4. **Global Query Filters** (`Data/MechanicShopContext.cs`)
   - Automatic filtering of all queries by `TenantId`
   - Prevents cross-tenant data access
   - Applied to: Customers, Vehicles, Appointments, ServiceRecords

5. **Base Controller** (`Controllers/TenantAwareControllerBase.cs`)
   - Provides tenant context to derived controllers
   - Helper properties: `CurrentTenantId`, `CurrentTenantSlug`
   - Helper methods: `TenantRequiredResult()`, `TenantNotFoundResult()`

## Database Schema

### Tenant Table

```sql
CREATE TABLE "Tenants" (
    "Id" integer PRIMARY KEY,
    "Slug" varchar(100) UNIQUE NOT NULL,
    "Name" varchar(200) NOT NULL,
    "BusinessAddress" text,
    "City" varchar(100),
    "State" varchar(50),
    "ZipCode" varchar(20),
    "Country" varchar(2) DEFAULT 'US',
    "Phone" varchar(20),
    "Email" varchar(200),
    "Website" varchar(500),
    "LogoUrl" text,
    "Description" text,
    "Plan" integer NOT NULL DEFAULT 1, -- TenantPlan enum
    "Status" integer NOT NULL DEFAULT 0, -- TenantStatus enum
    "TrialEndsAt" timestamp,
    "SubscriptionEndsAt" timestamp,
    "IntegrationSettings" text, -- JSON
    "MediaStoragePath" varchar(500),
    "StorageUsedBytes" bigint DEFAULT 0,
    "StorageLimitBytes" bigint DEFAULT 5368709120, -- 5GB
    "MaxUsers" integer DEFAULT 5,
    "MaxCustomers" integer DEFAULT 100,
    "MaxVehicles" integer DEFAULT 200,
    "CreatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" timestamp,
    "CreatedBy" varchar(200)
);

CREATE INDEX "IX_Tenants_Slug" ON "Tenants" ("Slug");
CREATE INDEX "IX_Tenants_Status" ON "Tenants" ("Status");
CREATE INDEX "IX_Tenants_Plan" ON "Tenants" ("Plan");
```

### Scoped Tables

All tenant-scoped tables now have:
- `TenantId` foreign key (indexed)
- Composite unique indexes with `TenantId`
- Cascade delete on tenant removal
- Global query filters applied

## Usage

### API Requests

#### Using HTTP Header

```bash
curl -H "X-Tenant-Slug: precision-auto" \
     http://localhost:5000/api/Customers
```

#### Using Route Parameter

```bash
curl http://localhost:5000/api/{tenantSlug}/Customers
```

#### Using JWT Claim

```json
{
  "sub": "user@example.com",
  "tenant_id": "1",
  "tenant_slug": "precision-auto"
}
```

### Testing Tenant Isolation

```bash
# Create customer for tenant 1
curl -X POST http://localhost:5000/api/Customers \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: precision-auto" \
  -d '{
    "tenantId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234"
  }'

# Query customers for tenant 1
curl -H "X-Tenant-Slug: precision-auto" \
     http://localhost:5000/api/Customers

# Query customers for tenant 2 (should not see tenant 1's customer)
curl -H "X-Tenant-Slug: acme-motors" \
     http://localhost:5000/api/Customers
```

## Seeded Test Tenants

Three test tenants are automatically seeded:

### 1. Precision Automotive
- **Slug**: `precision-auto`
- **Plan**: Professional
- **Max Customers**: 1,000
- **Max Vehicles**: 2,000

### 2. ACME Motors & Repair
- **Slug**: `acme-motors`
- **Plan**: Basic
- **Max Customers**: 500
- **Max Vehicles**: 1,000

### 3. Speedway Service Center
- **Slug**: `speedway-service`
- **Plan**: Enterprise
- **Max Customers**: 10,000
- **Max Vehicles**: 20,000

## Security & Isolation

### Query Filter Implementation

All tenant-scoped entities have a global query filter:

```csharp
entity.HasQueryFilter(e =>
    _tenantAccessor.TenantId == null ||
    e.TenantId == _tenantAccessor.TenantId);
```

This ensures:
- All queries are automatically filtered by tenant
- No accidental cross-tenant data access
- If no tenant context is set, all data is returned (admin use case)

### Data Insertion

**IMPORTANT**: When creating new entities, you MUST set the `TenantId`:

```csharp
var customer = new Customer
{
    TenantId = CurrentTenantId, // From TenantAwareControllerBase
    FirstName = "John",
    // ... other properties
};
```

### Testing Cross-Tenant Isolation

Run the unit tests:

```bash
cd MechanicShopAPI.Tests
dotnet test
```

Tests verify:
- ✅ Customers are isolated by tenant
- ✅ Vehicles are isolated by tenant
- ✅ Appointments are isolated by tenant
- ✅ Cannot access other tenant's data
- ✅ Can insert data with tenant context
- ✅ Related entities are also filtered
- ✅ Switching tenant context changes results

## Media & File Storage

### Tenant-Scoped Storage Paths

Each tenant has a unique storage path:

```
/tenants/{slug}/media/
```

Example paths:
- `/tenants/precision-auto/media/`
- `/tenants/acme-motors/media/`
- `/tenants/speedway-service/media/`

### Signed URL Generation

When generating signed URLs for media, include the tenant slug:

```csharp
public string GenerateSignedUrl(string fileName)
{
    var tenantPath = $"/tenants/{CurrentTenantSlug}/media/{fileName}";
    // Generate signed URL with tenant path
    return SignUrl(tenantPath, expiresIn: TimeSpan.FromHours(1));
}
```

## Integration Settings

Tenants can have their own integration credentials stored in `IntegrationSettings` JSON field:

```json
{
  "stripe": {
    "publicKey": "pk_test_...",
    "secretKey": "sk_test_..."
  },
  "twilio": {
    "accountSid": "AC...",
    "authToken": "..."
  },
  "sendgrid": {
    "apiKey": "SG..."
  }
}
```

### Accessing Integration Settings

```csharp
var tenant = await _context.Tenants
    .FindAsync(CurrentTenantId);

var settings = JsonSerializer.Deserialize<IntegrationSettings>(
    tenant.IntegrationSettings);

// Use tenant-specific credentials
var stripeClient = new StripeClient(settings.Stripe.SecretKey);
```

## Plan-Based Features

### Plan Limits

```csharp
public enum TenantPlan
{
    Free = 0,        // 10 customers, 20 vehicles, 1 user
    Basic = 1,       // 500 customers, 1000 vehicles, 5 users
    Professional = 2,// 1000 customers, 2000 vehicles, 10 users
    Enterprise = 3   // 10000+ customers, 20000+ vehicles, 50+ users
}
```

### Enforcing Limits

```csharp
// In controller
var tenant = await _context.Tenants.FindAsync(CurrentTenantId);
var customerCount = await _context.Customers.CountAsync();

if (customerCount >= tenant.MaxCustomers)
{
    return BadRequest(new {
        error = "Customer limit reached for your plan",
        limit = tenant.MaxCustomers,
        current = customerCount
    });
}
```

## Subdomain Routing

### Configuration

For subdomain-based routing (e.g., `precision-auto.example.com`):

1. Configure DNS wildcard: `*.example.com → your-server-ip`
2. Update CORS in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowTenants",
        policy =>
        {
            policy.WithOrigins("https://*.example.com")
                  .SetIsOriginAllowedToAllowWildcardSubdomains()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
```

3. The middleware automatically extracts the tenant from the subdomain

## Deployment Considerations

### Production Checklist

- [ ] Remove or secure test tenants
- [ ] Implement tenant onboarding flow
- [ ] Add tenant admin dashboard
- [ ] Configure production connection strings per tenant (if using database-per-tenant)
- [ ] Set up backup strategy per tenant
- [ ] Implement audit logging with tenant context
- [ ] Configure CDN with tenant-scoped paths
- [ ] Set up monitoring per tenant
- [ ] Implement rate limiting per tenant
- [ ] Configure tenant-specific email domains

### Database Strategies

#### Current: Shared Database with Row-Level Isolation
- ✅ Simple to manage
- ✅ Cost-effective
- ✅ Easy to scale initially
- ⚠️ All tenants share resources
- ⚠️ Requires careful query filtering

#### Future: Database-per-Tenant
- ✅ Complete isolation
- ✅ Easy to backup/restore per tenant
- ✅ Custom schema per tenant possible
- ⚠️ More complex management
- ⚠️ Higher operational cost

#### Future: Schema-per-Tenant (PostgreSQL)
- ✅ Good isolation
- ✅ Shared database server
- ✅ Easier than database-per-tenant
- ⚠️ PostgreSQL-specific

## Troubleshooting

### "Tenant not found" errors

1. Check tenant exists in database:
   ```sql
   SELECT * FROM "Tenants" WHERE "Slug" = 'your-slug';
   ```

2. Verify tenant is active:
   ```sql
   SELECT * FROM "Tenants" WHERE "Status" = 0; -- Active
   ```

3. Check middleware is configured in `Program.cs`:
   ```csharp
   app.UseTenantResolution(); // Must be before UseAuthorization()
   ```

### Cross-tenant data leakage

1. Verify all scoped entities have `TenantId` foreign key
2. Check global query filters are applied in `DbContext`
3. Ensure `TenantId` is set when creating entities
4. Run unit tests: `cd MechanicShopAPI.Tests && dotnet test`

### Performance issues

1. Ensure indexes exist on `TenantId` columns:
   ```sql
   CREATE INDEX IF NOT EXISTS "IX_Customers_TenantId"
   ON "Customers" ("TenantId");
   ```

2. Consider adding composite indexes for common queries:
   ```sql
   CREATE INDEX "IX_Appointments_TenantId_ScheduledDate"
   ON "Appointments" ("TenantId", "ScheduledDate");
   ```

## Next Steps

1. **User Management**: Add user-tenant relationships
2. **Tenant Onboarding**: Build signup flow
3. **Admin Dashboard**: Create tenant management UI
4. **Billing Integration**: Connect to Stripe/payment processor
5. **Usage Tracking**: Monitor per-tenant resource usage
6. **Custom Domains**: Support `custom-domain.com` per tenant
7. **Webhooks**: Tenant-scoped webhook endpoints
8. **API Keys**: Tenant-specific API authentication

## API Endpoints for Tenant Management

Create a `TenantsController` for tenant CRUD operations:

```csharp
[ApiController]
[Route("api/[controller]")]
public class TenantsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Tenant>>> GetTenants()
    {
        // Admin only - list all tenants
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<Tenant>> GetTenant(string slug)
    {
        // Get tenant by slug
    }

    [HttpPost]
    public async Task<ActionResult<Tenant>> CreateTenant(TenantCreateDto dto)
    {
        // Create new tenant (onboarding)
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTenant(int id, TenantUpdateDto dto)
    {
        // Update tenant settings
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTenant(int id)
    {
        // Soft delete tenant
    }
}
```

## Support

For questions or issues with multi-tenancy:
1. Check this documentation
2. Review unit tests in `MechanicShopAPI.Tests/TenantIsolationTests.cs`
3. Examine middleware logs for tenant resolution issues
