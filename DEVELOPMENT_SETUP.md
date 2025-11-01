# 🚀 Development Setup & Testing Guide

This guide covers the complete development workflow including shared types, testing, and CI/CD.

## Table of Contents
1. [Shared TypeScript Types](#shared-typescript-types)
2. [Testing Setup](#testing-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Development Workflow](#development-workflow)

---

## 📝 Shared TypeScript Types

### Why This Matters
Your backend (C#) defines the API contracts. Your frontend (TypeScript) needs to match them exactly. Instead of manually keeping them in sync, we **auto-generate** TypeScript types from your C# models.

### How It Works

1. **Backend generates OpenAPI spec** → `http://localhost:5000/swagger/v1/swagger.json`
2. **NSwag reads the spec** → Generates TypeScript interfaces
3. **Frontend uses generated types** → Always in sync!

### Quick Start

```bash
# Install NSwag CLI globally
npm install -g nswag

# Generate types (backend must be running)
cd /Users/caleb/Code/CalebsShop
dotnet run --project MechanicShopAPI &  # Start backend
sleep 5  # Wait for it to start
nswag openapi2tsclient /input:http://localhost:5000/swagger/v1/swagger.json /output:frontend/src/generated/api.ts /template:Fetch
```

### Generated Types Example

**Before (manual):**
```typescript
// frontend/src/types/index.ts - You manually maintain this
export interface Customer {
  id: number;
  firstName: string;
  // Hope it matches the backend!
}
```

**After (auto-generated):**
```typescript
// frontend/src/generated/api.ts - Auto-generated, always correct
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Exactly matches C# model!
}

// Bonus: Full API client generated too!
const client = new CustomersClient("http://localhost:5000");
const customers = await client.getAll();
```

### npm Script (Recommended)

Add to `frontend/package.json`:
```json
{
  "scripts": {
    "generate:types": "nswag openapi2tsclient /input:http://localhost:5000/swagger/v1/swagger.json /output:src/generated/api.ts /template:Fetch"
  }
}
```

Usage:
```bash
cd frontend
npm run generate:types
```

---

## 🧪 Testing Setup

We're using **Playwright** (better than Cypress) for E2E tests.

### Why Playwright?

| Feature | Playwright | Cypress |
|---------|-----------|---------|
| Multi-browser | ✅ Chrome, Firefox, Safari | ⚠️ Mostly Chrome |
| Speed | ✅ Fast parallel execution | ⚠️ Slower |
| API testing | ✅ Built-in | ⚠️ Requires plugins |
| Auto-wait | ✅ Smart waiting | ⚠️ Manual waits |
| Components testing | ✅ Yes | ✅ Yes |

### Installation

```bash
cd frontend
npm install -D @playwright/test
npx playwright install  # Installs browsers
```

### Test Structure

```
frontend/
├── tests/
│   ├── e2e/                    # End-to-end tests
│   │   ├── auth.spec.ts        # Login, register, logout
│   │   ├── customers.spec.ts   # Customer CRUD
│   │   ├── appointments.spec.ts
│   │   └── workflows.spec.ts   # Full user journeys
│   ├── api/                    # API integration tests
│   │   ├── customers-api.spec.ts
│   │   └── auth-api.spec.ts
│   └── fixtures/               # Test data
│       └── test-data.ts
└── playwright.config.ts
```

### Example Test

```typescript
// tests/e2e/customers.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'testing@testing.com');
    await page.fill('[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should create a new customer', async ({ page }) => {
    await page.goto('http://localhost:5173/customers');
    await page.click('text=Add Customer');

    // Fill form
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="phone"]', '555-1234');

    await page.click('button:has-text("Create")');

    // Verify success
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    await page.goto('http://localhost:5173/customers');
    await page.click('text=Add Customer');

    // Submit empty form
    await page.click('button:has-text("Create")');

    // Check for error messages
    await expect(page.locator('text=required')).toBeVisible();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with UI (interactive mode)
npm run test:ui

# Run specific test file
npx playwright test tests/e2e/customers.spec.ts

# Run in headed mode (see the browser)
npm run test:headed

# Debug mode
npx playwright test --debug
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Smart Pipeline Features

✅ Only run backend tests if backend code changed
✅ Only run frontend tests if frontend code changed
✅ Parallel execution for speed
✅ Auto-generate types on backend changes
✅ Deploy only if all tests pass

### Setup

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Detect what changed
  changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            backend:
              - 'MechanicShopAPI/**'
            frontend:
              - 'frontend/**'

  # Backend tests
  backend-tests:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: mechanicshop_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Restore dependencies
        run: dotnet restore MechanicShopAPI

      - name: Build
        run: dotnet build MechanicShopAPI --no-restore

      - name: Run tests
        run: dotnet test MechanicShopAPI.Tests --no-build --verbosity normal
        env:
          ConnectionStrings__DefaultConnection: "Host=localhost;Database=mechanicshop_test;Username=postgres;Password=postgres"

  # Frontend tests
  frontend-tests:
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Lint
        run: |
          cd frontend
          npm run lint

      - name: Type check
        run: |
          cd frontend
          npm run build

      - name: Install Playwright browsers
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run E2E tests
        run: |
          cd frontend
          npm test

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: frontend/test-results/

  # Generate types if backend changed
  generate-types:
    needs: [changes, backend-tests]
    if: needs.changes.outputs.backend == 'true' && needs.backend-tests.result == 'success'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install NSwag
        run: npm install -g nswag

      - name: Start backend
        run: |
          cd MechanicShopAPI
          dotnet run &
          sleep 10  # Wait for API to start

      - name: Generate TypeScript types
        run: nswag openapi2tsclient /input:http://localhost:5000/swagger/v1/swagger.json /output:frontend/src/generated/api.ts /template:Fetch

      - name: Commit generated types
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: auto-generate TypeScript types from API changes"
          file_pattern: "frontend/src/generated/*"
```

### What This Pipeline Does

1. **Detects Changes**: Only runs relevant tests
2. **Backend Tests**: Runs .NET tests with real PostgreSQL
3. **Frontend Tests**: Linting, type-checking, Playwright E2E tests
4. **Auto-Generate Types**: If backend changes, regenerates TypeScript
5. **Auto-Commit**: Commits generated types back to the branch

### Cost: **$0** (GitHub Actions is free for public repos, 2000 min/month for private)

---

## 🛠️ Development Workflow

### Daily Development

```bash
# 1. Start backend
cd MechanicShopAPI
dotnet run

# 2. Start frontend (new terminal)
cd frontend
npm run dev

# 3. Make changes to backend C# models

# 4. Regenerate TypeScript types
npm run generate:types

# 5. Frontend now has updated types!
```

### Before Committing

```bash
# Run tests
cd frontend
npm test

# Lint code
npm run lint

# Build to check for errors
npm run build
```

### Creating a Feature

```bash
# 1. Create branch
git checkout -b feature/add-invoicing

# 2. Add C# model
# MechanicShopAPI/Models/Invoice.cs

# 3. Add controller
# MechanicShopAPI/Controllers/InvoicesController.cs

# 4. Generate types
cd frontend && npm run generate:types

# 5. Use generated types in frontend
import { Invoice, InvoicesClient } from './generated/api';

# 6. Write tests
# tests/e2e/invoices.spec.ts

# 7. Run tests
npm test

# 8. Commit
git add .
git commit -m "feat: add invoicing system"
git push

# 9. CI/CD runs automatically on GitHub
```

---

## 📊 Testing Best Practices

### What to Test

**✅ DO Test:**
- User workflows (login → create customer → book appointment)
- Form validation (required fields, email format, etc.)
- API error handling (network errors, 401, 500)
- Multi-tenancy (data isolation between shops)
- Edge cases (empty states, pagination, filtering)

**❌ DON'T Test:**
- Third-party libraries (React, Vite already tested)
- Styling/CSS (too brittle, use visual regression testing instead)
- Database internals (that's Entity Framework's job)

### Test Data Management

```typescript
// tests/fixtures/test-data.ts
export const TEST_USERS = {
  owner: {
    email: 'owner@test.com',
    password: 'Test1234!',
  },
  technician: {
    email: 'tech@test.com',
    password: 'Test1234!',
  },
};

export const TEST_CUSTOMERS = {
  john: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
  },
};

// Use in tests
import { TEST_USERS, TEST_CUSTOMERS } from '../fixtures/test-data';

test('owner can create customers', async ({ page }) => {
  await login(page, TEST_USERS.owner);
  await createCustomer(page, TEST_CUSTOMERS.john);
});
```

---

## 🎯 Next Steps

1. **Install Playwright**:
   ```bash
   cd frontend
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Create first test** (copy example above)

3. **Setup GitHub Actions** (copy workflow above to `.github/workflows/ci.yml`)

4. **Run tests locally**:
   ```bash
   npm test
   ```

5. **Push to GitHub** → CI/CD runs automatically!

---

## 📚 Resources

- [Playwright Docs](https://playwright.dev)
- [NSwag Documentation](https://github.com/RicoSuter/NSwag)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [ASP.NET Core Testing](https://learn.microsoft.com/en-us/aspnet/core/test/)

---

**Questions?** Check the examples in this file or ask for help!
