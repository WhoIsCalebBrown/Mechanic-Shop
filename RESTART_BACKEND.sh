#!/bin/bash

echo "========================================="
echo "Restarting Backend to Apply Migrations"
echo "========================================="

# Navigate to backend directory
cd "$(dirname "$0")/MechanicShopAPI"

# Kill any existing dotnet processes
echo "Stopping existing backend..."
pkill -f "dotnet run" || true
sleep 2

# Start the backend
echo "Starting backend with migrations..."
dotnet run

echo "Backend is now running with SiteSettings table!"
