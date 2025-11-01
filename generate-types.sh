#!/bin/bash

# Script to generate TypeScript types from ASP.NET Core API
# This ensures frontend types are always in sync with backend

set -e  # Exit on error

echo "🔧 Generating TypeScript types from C# API..."

# 1. Start the backend API (if not already running)
echo "📡 Starting backend API..."
(cd MechanicShopAPI && dotnet run &)
BACKEND_PID=$!

# Wait for API to start
echo "⏳ Waiting for API to be ready..."
sleep 5

# Check if API is responding
if ! curl -s http://localhost:5000/swagger/v1/swagger.json > /dev/null; then
    echo "❌ Error: API not responding. Make sure backend is running on http://localhost:5000"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# 2. Download OpenAPI spec
echo "📥 Downloading OpenAPI specification..."
curl -s http://localhost:5000/swagger/v1/swagger.json > frontend/openapi.json

# 3. Generate TypeScript client
echo "⚙️  Generating TypeScript types..."
npx @openapitools/openapi-generator-cli generate \
  -i frontend/openapi.json \
  -g typescript-fetch \
  -o frontend/src/generated \
  --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true

# 4. Clean up
echo "🧹 Cleaning up..."
kill $BACKEND_PID 2>/dev/null || true
rm frontend/openapi.json

echo "✅ TypeScript types generated successfully!"
echo "📁 Types available at: frontend/src/generated/"
echo ""
echo "💡 Tip: Run this script whenever you change your C# models or DTOs"
