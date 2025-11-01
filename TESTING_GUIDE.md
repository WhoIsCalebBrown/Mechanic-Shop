# 🧪 Complete Testing & CI/CD Setup

## ✅ What's Been Set Up

### 1. **Shared TypeScript Types from C#**
- ✅ NSwag installed in backend
- ✅ OpenAPI spec available at `http://localhost:5000/swagger/v1/swagger.json`
- ✅ Ready to auto-generate TypeScript types

### 2. **GitHub Actions CI/CD**
- ✅ Smart pipeline that only runs relevant tests
- ✅ Parallel backend + frontend testing
- ✅ PostgreSQL database for tests
- ✅ Artifact uploads for debugging

### 3. **Testing Framework Ready**
- ✅ Scripts added to `package.json`
- ✅ Playwright setup instructions provided

---

## 🚀 Quick Start

### Generate TypeScript Types

**Option 1: Manual (when needed)**
```bash
# Make sure backend is running
cd MechanicShopAPI && dotnet run

# In another terminal, generate types
cd frontend
npm install -g nswag
nswag openapi2tsclient \
  /input:http://localhost:5000/swagger/v1/swagger.json \
  /output:src/generated/api.ts \
  /template:Fetch
```

**Option 2: Watch mode (auto-regenerate on changes)**
```bash
# Install nodemon
npm install -g nodemon

# Watch backend files and regenerate on change
nodemon --watch ../MechanicShopAPI --ext cs --exec "nswag openapi2tsclient /input:http://localhost:5000/swagger/v1/swagger.json /output:src/generated/api.ts /template:Fetch"
```

### Setup Playwright Testing

```bash
cd frontend

# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Initialize Playwright config
npx playwright init
```

This creates:
- `playwright.config.ts` - Test configuration
- `tests/` - Test directory
- `tests/example.spec.ts` - Example test

### Run Tests

```bash
# Run all tests
npm test

# Run with UI (interactive debugging)
npm run test:ui

# Run in headed mode (see the browser)
npm run test:headed

# Run specific test
npx playwright test tests/e2e/customers.spec.ts

# Debug mode (step through tests)
npx playwright test --debug
```

---

## 📝 Example Tests

### E2E Test: Customer CRUD

Create `frontend/tests/e2e/customers.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'testing@testing.com',
  password: 'Test1234!'
};

const NEW_CUSTOMER = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '555-9876',
  address: '123 Main St'
};

test.describe('Customer Management', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should display customers page', async ({ page }) => {
    await page.goto('http://localhost:5173/customers');
    await expect(page.locator('h1')).toContainText('Customers');
  });

  test('should create a new customer', async ({ page }) => {
    await page.goto('http://localhost:5173/customers');

    // Click "Add Customer" button
    await page.click('text=Add Customer');

    // Fill out form
    await page.fill('input[name="firstName"]', NEW_CUSTOMER.firstName);
    await page.fill('input[name="lastName"]', NEW_CUSTOMER.lastName);
    await page.fill('input[name="email"]', NEW_CUSTOMER.email);
    await page.fill('input[name="phone"]', NEW_CUSTOMER.phone);
    await page.fill('input[name="address"]', NEW_CUSTOMER.address);

    // Submit form
    await page.click('button:has-text("Create")');

    // Verify customer appears in list
    await expect(page.locator(`text=${NEW_CUSTOMER.firstName} ${NEW_CUSTOMER.lastName}`))
      .toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('http://localhost:5173/customers');
    await page.click('text=Add Customer');

    // Try to submit empty form
    await page.click('button:has-text("Create")');

    // Check for validation errors
    const errorMessages = page.locator('.error-message, [role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should edit existing customer', async ({ page }) => {
    await page.goto('http://localhost:5173/customers');

    // Find and click edit button (assuming it exists)
    await page.click('button:has-text("Edit")', { timeout: 5000 });

    // Change first name
    await page.fill('input[name="firstName"]', 'Updated');
    await page.click('button:has-text("Update")');

    // Verify updated name appears
    await expect(page.locator('text=Updated')).toBeVisible();
  });
});
```

### API Test: Direct Backend Testing

Create `frontend/tests/api/customers-api.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';
let authToken: string;

test.describe('Customers API', () => {
  // Login before tests to get auth token
  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'testing@testing.com',
        password: 'Test1234!'
      }
    });

    const data = await response.json();
    authToken = data.accessToken;
  });

  test('GET /api/customers - should return customers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/customers`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const customers = await response.json();
    expect(Array.isArray(customers)).toBeTruthy();
  });

  test('POST /api/customers - should create customer', async ({ request }) => {
    const newCustomer = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      phone: '555-0000'
    };

    const response = await request.post(`${API_BASE}/customers`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: newCustomer
    });

    expect(response.ok()).toBeTruthy();
    const created = await response.json();
    expect(created.firstName).toBe(newCustomer.firstName);
    expect(created.id).toBeDefined();
  });

  test('POST /api/customers - should fail without auth', async ({ request }) => {
    const response = await request.post(`${API_BASE}/customers`, {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '555-0000'
      }
    });

    expect(response.status()).toBe(401); // Unauthorized
  });
});
```

---

## 🎯 CI/CD Pipeline

### How It Works

1. **Push to GitHub** → Workflow triggers
2. **Detect Changes** → Only runs relevant tests
3. **Run Tests in Parallel**:
   - Backend tests (if C# code changed)
   - Frontend tests (if TypeScript/React changed)
4. **Upload Artifacts** → Test results & builds saved
5. **Pass/Fail** → Green checkmark or red X on PR

### What Gets Tested

**Backend:**
- ✅ Compiles without errors
- ✅ Unit tests pass
- ✅ Integration tests with real database

**Frontend:**
- ✅ Linting (code style)
- ✅ TypeScript compiles
- ✅ Builds successfully
- ✅ Playwright E2E tests

### Viewing Results

1. Go to GitHub repository
2. Click "Actions" tab
3. See workflow runs with pass/fail status
4. Click run to see detailed logs
5. Download artifacts (test screenshots, build output)

---

## 🛠️ Development Workflow

### Daily Workflow

```bash
# Morning setup
git pull
cd MechanicShopAPI && dotnet restore
cd ../frontend && npm install

# Start development servers
# Terminal 1: Backend
cd MechanicShopAPI && dotnet run

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Watch tests (optional)
cd frontend && npm run test:ui
```

### Making Changes

**Scenario: Add new "Invoice" feature**

```bash
# 1. Create C# model
# MechanicShopAPI/Models/Invoice.cs

# 2. Create controller
# MechanicShopAPI/Controllers/InvoicesController.cs

# 3. Generate TypeScript types
cd frontend
nswag openapi2tsclient /input:http://localhost:5000/swagger/v1/swagger.json /output:src/generated/api.ts /template:Fetch

# 4. Use generated types
import { Invoice, InvoicesClient } from './generated/api';

# 5. Write E2E test
# tests/e2e/invoices.spec.ts

# 6. Run tests
npm test

# 7. Commit (CI/CD runs automatically)
git add .
git commit -m "feat: add invoicing system"
git push origin feature/invoices
```

---

## 📊 Test Coverage Goals

**Current Status:**
- Backend: 0% (no tests yet)
- Frontend: 0% (Playwright not initialized)

**Target Coverage:**
- Backend: 70%+ critical paths
- Frontend: 80%+ user flows

**What to Test (Priority Order):**

1. **Critical Paths** (Must have 100% coverage):
   - Login/logout
   - Multi-tenant data isolation
   - Payment processing (if applicable)

2. **Core Features** (70%+ coverage):
   - Customer CRUD
   - Appointment scheduling
   - Vehicle management
   - Service records

3. **Nice to Have** (30%+ coverage):
   - Edge cases
   - Error handling
   - UI interactions

---

## 🐛 Debugging Failed Tests

### Playwright Debug Mode

```bash
# Run test in debug mode
npx playwright test --debug tests/e2e/customers.spec.ts

# This opens:
# - Browser window (see what's happening)
# - Playwright Inspector (step through test)
# - Console (see logs)
```

### View Test Screenshots

```bash
# Tests automatically capture screenshots on failure
# Location: frontend/test-results/

# Open last failed test
open frontend/test-results/customers-should-create-a-new-customer/test-failed-1.png
```

### Headed Mode (See Browser)

```bash
# Run tests with browser visible
npm run test:headed

# Or specific test
npx playwright test --headed tests/e2e/customers.spec.ts
```

---

## 📚 Next Steps

1. **Initialize Playwright**:
   ```bash
   cd frontend
   npm install -D @playwright/test
   npx playwright install
   npx playwright init
   ```

2. **Write Your First Test** (copy example above)

3. **Run It**:
   ```bash
   npm test
   ```

4. **Push to GitHub** → CI/CD runs automatically!

5. **Iterate**: Write more tests as you build features

---

## 🎓 Learning Resources

- **Playwright**: https://playwright.dev/docs/intro
- **Testing Best Practices**: https://playwright.dev/docs/best-practices
- **CI/CD with GitHub Actions**: https://docs.github.com/en/actions
- **NSwag TypeScript Generation**: https://github.com/RicoSuter/NSwag/wiki/TypeScriptClientGenerator

---

**Questions? Issues?** Check the examples above or open an issue!
