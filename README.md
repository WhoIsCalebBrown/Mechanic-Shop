# Caleb's Mechanic Shop Application

A full-stack mechanic shop management application for scheduling appointments and customer management.

## Technology Stack

### Backend
- ASP.NET Core 9.0 Web API
- Entity Framework Core with SQLite
- Swagger/OpenAPI for API documentation

### Frontend
- React 18 with TypeScript
- Vite for build tooling

## Project Structure

```
CalebsShop/
├── MechanicShopAPI/          # ASP.NET Core Web API backend
│   ├── Controllers/          # API controllers
│   ├── Models/              # Domain models
│   ├── Data/                # Database context
│   └── Migrations/          # EF Core migrations
└── frontend/                # React frontend
```

## Features

- **Customer Management**: Create, view, update, and delete customer records
- **Vehicle Tracking**: Associate vehicles with customers and track vehicle details
- **Appointment Scheduling**: Schedule and manage service appointments
- **Service Records**: Track service history for each vehicle with costs and details

## Data Models

### Customer
- Personal information (name, email, phone, address)
- Associated vehicles
- Appointment history

### Vehicle
- Vehicle details (make, model, year, VIN, license plate)
- Ownership information
- Service history
- Scheduled appointments

### Appointment
- Scheduled date and time
- Service type and description
- Status tracking (Scheduled, InProgress, Completed, Cancelled, NoShow)
- Links to customer and vehicle

### Service Record
- Service details and costs
- Labor and parts breakdown
- Technician information
- Mileage at service

## Getting Started

### Prerequisites
- .NET 9.0 SDK
- Node.js (v18 or higher)
- npm or yarn

### Running the Backend

1. Navigate to the API directory:
   ```bash
   cd ~/Code/CalebsShop/MechanicShopAPI
   ```

2. Run the API:
   ```bash
   dotnet run
   ```

   The API will start at:
   - HTTPS: https://localhost:7xxx (port shown in console)
   - HTTP: http://localhost:5xxx (port shown in console)
   - Swagger UI: https://localhost:7xxx/swagger

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ~/Code/CalebsShop/frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start at http://localhost:5173

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/{id}` - Get vehicle by ID
- `GET /api/vehicles/customer/{customerId}` - Get vehicles by customer
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/customer/{customerId}` - Get appointments by customer
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/{id}` - Update appointment
- `PATCH /api/appointments/{id}/status` - Update appointment status
- `DELETE /api/appointments/{id}` - Delete appointment

### Service Records
- `GET /api/servicerecords` - Get all service records
- `GET /api/servicerecords/{id}` - Get service record by ID
- `GET /api/servicerecords/vehicle/{vehicleId}` - Get service records by vehicle
- `POST /api/servicerecords` - Create new service record
- `PUT /api/servicerecords/{id}` - Update service record
- `DELETE /api/servicerecords/{id}` - Delete service record

## Database

The application uses SQLite for data storage. The database file (`mechanicshop.db`) is created automatically when you first run the API.

### Migrations

To create a new migration:
```bash
dotnet ef migrations add MigrationName
```

To update the database:
```bash
dotnet ef database update
```

## Development

### Backend Development
- The API uses Swagger for documentation and testing
- Access Swagger UI at https://localhost:7xxx/swagger when the API is running
- CORS is configured to allow requests from the React frontend

### Frontend Development
- The frontend is set up with React + TypeScript
- Vite provides fast HMR (Hot Module Replacement) during development
- API calls should be made to http://localhost:5xxx or https://localhost:7xxx

## Next Steps

1. Build out the React frontend with components for:
   - Customer list and detail views
   - Vehicle management
   - Appointment calendar/scheduler
   - Service record tracking

2. Add authentication and authorization

3. Implement search and filtering capabilities

4. Add reporting and analytics features

5. Deploy to production environment
