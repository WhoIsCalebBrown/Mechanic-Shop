# Playwright E2E Tests

This directory contains end-to-end tests for the CalebsShop frontend application using Playwright.

## Test Coverage

### Onboarding Flow (94 tests)
Comprehensive test suite covering the complete 4-step onboarding wizard:

- **Wizard Navigation** (`onboarding-wizard.spec.ts`) - 18 tests
  - Step indicators and progress bar
  - Back/Next navigation
  - Data persistence across steps
  - Step completion checkmarks

- **Step 1: Business Profile** (`onboarding-step1-business-profile.spec.ts`) - 16 tests
  - Required field validation
  - Phone number auto-formatting
  - Email validation
  - Logo upload functionality

- **Step 2: Service Area** (`onboarding-step2-service-area.spec.ts`) - 13 tests
  - City, state, and radius selection
  - Visual radius indicator
  - Required field validation

- **Step 3: Operating Hours** (`onboarding-step3-operating-hours.spec.ts`) - 16 tests
  - Day toggle functionality
  - Time input validation
  - "Apply to all days" feature
  - Default hours (Mon-Fri 9am-5pm)

- **Step 4: Services** (`onboarding-step4-services.spec.ts`) - 20 tests
  - Service template selection
  - Category filtering
  - Select/Clear all functionality
  - Skippable step behavior

- **Complete Flow** (`onboarding-complete-flow.spec.ts`) - 11 tests
  - End-to-end wizard completion
  - Data persistence throughout entire flow
  - Loading states and error handling

- **API Integration** (`onboarding-with-mocks.spec.ts`) - 10 tests
  - API payload validation
  - Success/error response handling
  - Loading states during submission
  - Network timeout handling

### Authentication Flow
- Login and registration tests
- Protected route access
- Token management

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run specific test file
```bash
npx playwright test tests/auth.spec.ts
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug tests
```bash
npx playwright test --debug
```

## Test Structure

- `example.spec.ts` - Basic page navigation and UI tests
- `auth.spec.ts` - Authentication flow tests (login, register, protected routes)
- `helpers.ts` - Reusable test helper functions

## Writing Tests

### Basic test structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Expected Title/);
  });
});
```

### Using helpers
```typescript
import { login, logout } from './helpers';

test('should access protected page', async ({ page }) => {
  await login(page, 'test@example.com', 'password123');
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

## Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Test directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Automatic dev server**: The dev server starts automatically before tests run

## Best Practices

1. **Use data-testid attributes** for stable selectors instead of relying on text or CSS classes
2. **Keep tests independent** - each test should be able to run in isolation
3. **Use page object models** for complex pages to improve maintainability
4. **Mock API responses** when testing UI behavior in isolation
5. **Use beforeEach/afterEach** for common setup/teardown
6. **Avoid hard-coded waits** - use Playwright's auto-waiting features

## Viewing Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## CI/CD Integration

Tests are configured to run differently in CI environments:
- Retries: 2 retries on CI, 0 locally
- Workers: 1 worker on CI, unlimited locally
- The `forbidOnly` setting prevents accidentally committed `.only` tests

## Test Fixtures and Helpers

### Fixtures (`tests/fixtures/`)
- `onboarding.ts` - Test data for onboarding flow
  - Business profile data
  - Service area configurations
  - Operating hours schedules
  - Service templates

- `test-logo.svg` - Sample logo file for upload tests

### Helpers (`tests/`)
- `helpers.ts` - General test utilities
  - `login()` - Authenticate users
  - `registerNewUser()` - Create new test accounts
  - `setupAuthenticatedSession()` - Fast auth setup via token
  - `logout()` - End user session
  - `isAuthenticated()` - Check auth status
  - `generateTestEmail()` - Create unique test emails
  - `waitForApiResponse()` - Wait for specific API calls

- `onboarding-helpers.ts` - Onboarding-specific utilities
  - `navigateToOnboarding()` - Go to onboarding page
  - `fillBusinessProfile()` - Complete step 1
  - `fillServiceArea()` - Complete step 2
  - `fillOperatingHours()` - Complete step 3
  - `selectServices()` - Select services in step 4
  - `clickNext()` / `clickBack()` - Navigation
  - `expectOnStep()` - Verify current step
  - `completeOnboardingFlow()` - Full wizard completion

### Mocks (`tests/mocks/`)
- `api.ts` - API response mocking
  - `mockOnboardingAPI()` - Mock successful onboarding
  - `mockOnboardingAPIError()` - Mock API errors
  - `mockSlowOnboardingAPI()` - Simulate slow responses
  - `mockAuthAPI()` - Mock authentication endpoints
  - `waitForAPICall()` - Intercept API requests
  - `captureAPIRequest()` - Capture request payloads

## Using Test Helpers

### Basic Onboarding Test
```typescript
import { test, expect } from '@playwright/test';
import { navigateToOnboarding, fillBusinessProfile, clickNext } from './onboarding-helpers';

test('should complete business profile', async ({ page }) => {
  await navigateToOnboarding(page);
  await fillBusinessProfile(page);
  await clickNext(page);
  // Now on step 2
});
```

### With Authentication
```typescript
import { login } from './helpers';

test.beforeEach(async ({ page }) => {
  await login(page); // Uses default test credentials
});
```

### With API Mocking
```typescript
import { mockOnboardingAPI } from './mocks/api';

test('should submit successfully', async ({ page }) => {
  await mockOnboardingAPI(page, {
    success: true,
    shopId: 123
  });

  // Complete onboarding...
});
```

## Running Specific Test Suites

```bash
# Run only onboarding tests
npm test onboarding

# Run only wizard navigation tests
npm test onboarding-wizard

# Run only a specific step's tests
npm test onboarding-step1-business-profile
npm test onboarding-step2-service-area
npm test onboarding-step3-operating-hours
npm test onboarding-step4-services

# Run complete flow tests
npm test onboarding-complete-flow

# Run API integration tests
npm test onboarding-with-mocks

# Run authentication tests
npm test auth
```

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests to `main`

The CI workflow:
1. Installs Playwright with Chromium browser
2. Runs all E2E tests
3. Uploads test results and HTML reports as artifacts
4. Retries failed tests 2 times (CI-specific)

View test reports in GitHub Actions artifacts after each run.

## Debugging Tests

### UI Mode (Recommended)
```bash
npm run test:ui
```
- Time-travel debugging
- Watch mode with auto-reload
- Step through each action
- See selectors and screenshots

### Debug Mode
```bash
npx playwright test --debug
```
- Opens Playwright Inspector
- Step through test execution
- Inspect elements live
- View console logs

### Headed Mode (See Browser)
```bash
npm run test:headed
```
- Watch tests run in real browser
- Useful for visual verification

### Specific Test Debugging
```bash
# Debug a single test file
npx playwright test onboarding-wizard.spec.ts --debug

# Debug a specific test by line number
npx playwright test onboarding-wizard.spec.ts:42 --debug

# Debug with specific browser
npx playwright test --project=firefox --debug
```

## Common Issues and Solutions

### Tests failing on logo upload
- Ensure `tests/fixtures/test-logo.svg` exists
- Check file size is under 2MB
- Verify file input selector matches your implementation

### Authentication issues
- Update `TEST_USER` credentials in `tests/helpers.ts`
- Check if auth token storage key matches (`localStorage.getItem('token')`)
- Verify API endpoints match your backend routes

### Selector not found errors
- Use `page.pause()` to inspect the page state
- Run in headed mode to see what's actually rendered
- Check if element is in shadow DOM or iframe
- Verify CSS class names match your implementation

### Tests passing locally but failing in CI
- CI uses Chromium only (configure more browsers if needed)
- CI runs in headless mode with different viewport
- Check for race conditions (add proper waits)
- Verify test data doesn't conflict between parallel runs

## Test Data Management

### Using Custom Test Data
```typescript
import { testBusinessProfile } from './fixtures/onboarding';

// Override specific fields
const customProfile = {
  ...testBusinessProfile,
  name: 'My Custom Shop',
  phone: '5551234567',
};

await fillBusinessProfile(page, customProfile);
```

### Generating Unique Data
```typescript
import { generateTestEmail } from './helpers';

const email = generateTestEmail('myshop');
// Returns: myshop1698765432000@example.com
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Project Onboarding Documentation](../DEVELOPMENT_SETUP.md)
