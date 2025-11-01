# Playwright Tests

End-to-end tests for the Mechanic Shop application.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm test -- --headed

# Run specific test file
npm test -- onboarding.spec.ts

# Run tests in a specific browser
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit
```

## Test Files

- `onboarding.spec.ts` - Onboarding wizard flow tests
- `setup/auth.setup.ts` - Authentication setup (runs before all tests)

## Authentication

Tests use a shared authenticated session created during setup. The test user is automatically created if it doesn't exist.

Test credentials:
- Email: `playwright-test@mechanicshop.com`
- Password: `TestPassword123!`

Auth state is stored in `tests/.auth/user.json` and shared across all tests.

## Debugging Failed Tests

```bash
# Show last test report
npx playwright show-report

# Run with debug mode
npm test -- --debug

# Run a single test
npm test -- onboarding.spec.ts:10
```

## CI/CD

Tests run in CI against all browsers (Chromium, Firefox, WebKit). See `playwright.config.ts` for configuration.
