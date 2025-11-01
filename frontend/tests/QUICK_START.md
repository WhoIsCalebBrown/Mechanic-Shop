# Playwright Tests - Quick Start Guide

## First Time Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

3. **Verify installation**:
   ```bash
   npx playwright --version
   ```

## Running Tests

### Quick Commands

```bash
# Run all tests (headless)
npm test

# Run tests with UI (recommended for development)
npm run test:ui

# Run tests with visible browser
npm run test:headed

# Run specific test file
npm test onboarding-wizard.spec.ts

# Run tests matching a pattern
npm test onboarding
```

### Debugging

```bash
# Open Playwright Inspector for debugging
npx playwright test --debug

# Debug specific test
npx playwright test onboarding-wizard.spec.ts:25 --debug

# Run with trace (for detailed debugging later)
npx playwright test --trace on
```

### View Reports

```bash
# After tests run, open the HTML report
npx playwright show-report
```

## Test Structure

```
tests/
├── fixtures/
│   ├── onboarding.ts          # Test data
│   └── test-logo.svg          # Sample logo file
├── mocks/
│   └── api.ts                 # API mocking utilities
├── helpers.ts                 # General test helpers
├── onboarding-helpers.ts      # Onboarding-specific helpers
├── auth.spec.ts               # Authentication tests
├── example.spec.ts            # Basic example tests
├── onboarding-wizard.spec.ts  # Wizard navigation tests
├── onboarding-step1-*.spec.ts # Step 1: Business Profile tests
├── onboarding-step2-*.spec.ts # Step 2: Service Area tests
├── onboarding-step3-*.spec.ts # Step 3: Operating Hours tests
├── onboarding-step4-*.spec.ts # Step 4: Services tests
├── onboarding-complete-flow.spec.ts  # End-to-end flow tests
└── onboarding-with-mocks.spec.ts     # API integration tests
```

## Common Test Patterns

### 1. Basic Page Test
```typescript
import { test, expect } from '@playwright/test';

test('should display page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CalebsShop/i);
});
```

### 2. With Authentication
```typescript
import { login } from './helpers';

test('should access protected page', async ({ page }) => {
  await login(page);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### 3. Using Onboarding Helpers
```typescript
import {
  navigateToOnboarding,
  fillBusinessProfile,
  clickNext,
} from './onboarding-helpers';

test('should complete step 1', async ({ page }) => {
  await navigateToOnboarding(page);
  await fillBusinessProfile(page);
  await clickNext(page);
});
```

### 4. With API Mocking
```typescript
import { mockOnboardingAPI } from './mocks/api';

test('should handle API response', async ({ page }) => {
  await mockOnboardingAPI(page, {
    success: true,
    shopId: 123,
  });

  // Run your test...
});
```

## Useful Playwright Commands

### Selectors
```typescript
// By text
page.getByText('Submit')
page.getByRole('button', { name: /submit/i })

// By label
page.getByLabel('Email')
page.getByLabel(/password/i)

// By placeholder
page.getByPlaceholder('Enter your email')

// By CSS
page.locator('.button')
page.locator('#submit-btn')

// Complex selectors
page.locator('.form input[type="email"]')
```

### Actions
```typescript
// Click
await page.getByRole('button').click()

// Fill input
await page.getByLabel('Email').fill('test@example.com')

// Select dropdown
await page.selectOption('select', 'option-value')

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file.jpg')

// Press keys
await page.keyboard.press('Enter')
await page.keyboard.type('Hello')

// Hover
await page.getByRole('button').hover()
```

### Assertions
```typescript
// Visibility
await expect(page.getByText('Hello')).toBeVisible()
await expect(page.getByText('Hidden')).toBeHidden()

// Values
await expect(page.getByLabel('Email')).toHaveValue('test@example.com')

// URL
await expect(page).toHaveURL(/.*dashboard/)

// Text content
await expect(page.getByRole('heading')).toContainText('Welcome')

// Attributes
await expect(page.getByRole('button')).toHaveAttribute('disabled')

// Count
await expect(page.locator('.item')).toHaveCount(5)
```

### Waiting
```typescript
// Wait for element
await page.waitForSelector('.button')

// Wait for URL
await page.waitForURL(/.*dashboard/)

// Wait for load state
await page.waitForLoadState('networkidle')

// Wait for timeout (use sparingly)
await page.waitForTimeout(1000)

// Wait for specific condition
await page.waitForFunction(() => document.title === 'Dashboard')
```

## Tips and Tricks

### 1. **Use test.describe for grouping**
```typescript
test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('test 1', async ({ page }) => { /* ... */ });
  test('test 2', async ({ page }) => { /* ... */ });
});
```

### 2. **Use page.pause() for debugging**
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Opens inspector
  await page.click('button');
});
```

### 3. **Take screenshots**
```typescript
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### 4. **Run specific browsers**
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### 5. **Run in parallel**
```bash
npx playwright test --workers=4
```

### 6. **Generate tests with Codegen**
```bash
npx playwright codegen http://localhost:5173
```

## Troubleshooting

### Tests timeout
- Increase timeout in playwright.config.ts
- Use more specific selectors
- Wait for proper load states

### Element not found
- Use `page.pause()` to inspect
- Check if element is in iframe
- Verify selector is correct

### Tests flaky
- Add proper waits
- Use `waitForLoadState('networkidle')`
- Avoid hard-coded timeouts

### Can't see what's happening
- Use `npm run test:headed`
- Add `await page.pause()`
- Check screenshots in test-results/

## Next Steps

1. **Read full README**: See [README.md](./README.md) for complete documentation
2. **Explore test files**: Check existing tests for patterns
3. **Run UI mode**: Try `npm run test:ui` for interactive testing
4. **Check Playwright docs**: Visit https://playwright.dev

## Quick Reference Card

| Task | Command |
|------|---------|
| Run all tests | `npm test` |
| Run with UI | `npm run test:ui` |
| Run headed | `npm run test:headed` |
| Debug | `npx playwright test --debug` |
| View report | `npx playwright show-report` |
| Run specific file | `npm test filename.spec.ts` |
| Generate code | `npx playwright codegen` |
| Update snapshots | `npx playwright test --update-snapshots` |

Need help? Check the [Playwright Documentation](https://playwright.dev) or the main [README.md](./README.md).
