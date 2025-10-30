# PostgreSQL Database Setup

## Overview
The Mechanic Shop API now uses PostgreSQL as its database, running in a Docker container for easy development and deployment.

## Quick Start

### Start PostgreSQL Container
```bash
docker compose up -d
```

### Stop PostgreSQL Container
```bash
docker compose down
```

### Stop and Remove Data (Fresh Start)
```bash
docker compose down -v
```

## Database Connection Strings

### Development
```
Host=localhost;Port=5432;Database=mechanicshop_dev;Username=postgres;Password=postgres
```

### Production
Update `appsettings.json` with your production PostgreSQL credentials:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-host;Port=5432;Database=mechanicshop;Username=your-user;Password=your-password"
  }
}
```

## Entity Framework Migrations

### Create a New Migration
```bash
export PATH="$HOME/.dotnet:$PATH:$HOME/.dotnet/tools" && \
export DOTNET_ROOT="$HOME/.dotnet" && \
export LD_LIBRARY_PATH="$HOME/.dotnet:$LD_LIBRARY_PATH" && \
dotnet-ef migrations add MigrationName
```

### Apply Migrations
```bash
export PATH="$HOME/.dotnet:$PATH:$HOME/.dotnet/tools" && \
export DOTNET_ROOT="$HOME/.dotnet" && \
export LD_LIBRARY_PATH="$HOME/.dotnet:$LD_LIBRARY_PATH" && \
dotnet-ef database update
```

### Remove Last Migration (if not applied)
```bash
export PATH="$HOME/.dotnet:$PATH:$HOME/.dotnet/tools" && \
export DOTNET_ROOT="$HOME/.dotnet" && \
export LD_LIBRARY_PATH="$HOME/.dotnet:$LD_LIBRARY_PATH" && \
dotnet-ef migrations remove
```

## PostgreSQL CLI Access

### Connect to PostgreSQL
```bash
docker exec -it mechanicshop-postgres psql -U postgres -d mechanicshop_dev
```

### Useful PostgreSQL Commands
```sql
-- List all tables
\dt

-- Describe a table
\d Customers

-- Show table data
SELECT * FROM "SiteSettings";

-- Exit psql
\q
```

## Database Schema

### Tables
- **Customers**: Customer information (FirstName, LastName, Email, Phone, Address)
- **Vehicles**: Vehicle information linked to customers
- **Appointments**: Service appointments
- **ServiceRecords**: Service history and records
- **SiteSettings**: Website configuration (with seed data)

### Seed Data
The database is automatically seeded with default site settings on first run.

## Docker Container Management

### View Container Logs
```bash
docker logs mechanicshop-postgres
```

### View Container Status
```bash
docker ps | grep mechanicshop-postgres
```

### Restart Container
```bash
docker restart mechanicshop-postgres
```

## Backup and Restore

### Backup Database
```bash
docker exec mechanicshop-postgres pg_dump -U postgres mechanicshop_dev > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker exec -i mechanicshop-postgres psql -U postgres -d mechanicshop_dev
```

## Multi-Tenant Support (Future Enhancement)

PostgreSQL is ready for multi-tenant support. Potential approaches:

1. **Schema-per-tenant**: Create separate schemas for each tenant
2. **Database-per-tenant**: Create separate databases for each tenant
3. **Shared-schema**: Add TenantId column to all tables

## JSONB Fields (Future Enhancement)

PostgreSQL's JSONB support can be used for flexible data storage:

```csharp
// Example: Add flexible metadata to ServiceRecord
public class ServiceRecord
{
    // ... existing properties
    public JsonDocument? Metadata { get; set; }
}
```

## Production Deployment

For production, consider:

1. Using a managed PostgreSQL service (AWS RDS, Azure Database, etc.)
2. Setting up proper backups and replication
3. Using connection pooling (PgBouncer)
4. Configuring SSL/TLS connections
5. Setting up monitoring and alerting
6. Using environment variables for sensitive connection strings

## Troubleshooting

### Port 5432 Already in Use
If you have another PostgreSQL instance running:
```bash
# Find what's using the port
sudo lsof -i:5432

# Stop the container and change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 on host instead
```

### Connection Refused
Make sure the container is running and healthy:
```bash
docker ps
docker logs mechanicshop-postgres
```

### Migration Errors
If migrations fail, check:
1. PostgreSQL container is running
2. Connection string is correct
3. Database exists and is accessible
4. No pending model changes in seed data (use static values)
