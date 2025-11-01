# Authentication Setup for Playwright Tests

## Overview

All tests now use **automatic authentication** - you don't need to manually create test users!

## How It Works

1. **Auth Setup Script** (`tests/setup/auth.setup.ts`):
   - Runs **once** before all tests
   - Tries to login with test credentials
   - If login fails, creates a new test account
   - Saves authentication state to `tests/.auth/user.json`

2. **All Tests**:
   - Automatically load the saved auth state
   - Start already logged in
   - No manual login needed in each test

## Test User Credentials

```typescript
Email:    playwright-test@mechanicshop.com
Password: TestPassword123!
Business: Playwright Test Shop
```

This user is defined in `tests/setup/auth.setup.ts` line 10-15.

## Running Tests

### First Time Setup

```bash
# Run tests - auth setup happens automatically
npm test
```

That's it! The auth setup will:
1. Create the test user if it doesn't exist
2. Login and save the session
3. Run your tests with authentication

### Subsequent Runs

The test user already exists, so:
1. Auth setup logs in (fast)
2. Tests run with saved session
3. Everything works automatically

## What Gets Created

### Test User Account
- Email: `playwright-test@mechanicshop.com`
- Will show up in your database
- Can login via UI at http://localhost:5173/login
- Will need to complete onboarding after first registration

### Auth State File
- Location: `tests/.auth/user.json`
- Contains: Cookies, localStorage, sessionStorage
- Gitignored: ✅ (won't be committed)
- Auto-created: ✅ (no manual steps)

## Customizing Test User

### Change Credentials

Edit `tests/setup/auth.setup.ts`:

```typescript
const TEST_USER = {
  email: 'your-custom-test@example.com',
  password: 'YourPassword123!',
  firstName: 'Custom',
  lastName: 'User',
};
```

### Delete and Recreate

```bash
# Delete the auth state
rm tests/.auth/user.json

# Delete from database (if needed)
# You'll need to do this manually in your DB

# Run tests - will recreate
npm test
```

## How Tests Use Authentication

### Old Way (Manual - Don't Do This):
```typescript
test('some test', async ({ page }) => {
  // ❌ Don't do this anymore
  await page.goto('/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');

  // Your test...
});
```

### New Way (Automatic):
```typescript
test('some test', async ({ page }) => {
  // ✅ Already logged in!
  await page.goto('/onboarding');

  // Your test starts here, no login needed
});
```

## Testing Different User States

### Test as Authenticated User (Default)

```typescript
test('authenticated test', async ({ page }) => {
  // Already logged in via auth.setup.ts
  await page.goto('/dashboard');
  // ...
});
```

### Test as Guest (Opt-out of Auth)

```typescript
import { test as base } from '@playwright/test';

const test = base.extend({
  storageState: { cookies: [], origins: [] },
});

test('guest test', async ({ page }) => {
  // Not logged in
  await page.goto('/');
  // ...
});
```

### Test Different User (Override)

```typescript
import { login } from './helpers';

test('different user', async ({ page, context }) => {
  // Clear existing auth
  await context.clearCookies();

  // Login as different user
  await login(page, 'other@example.com', 'password');

  // Your test...
});
```

## Troubleshooting

### Auth setup fails

**Error:** "Registration failed" or "Login failed"

**Fix:**
1. Check if your dev server is running: `npm run dev`
2. Check if backend is running
3. Verify RegisterPage fields match:
   - `#businessName`
   - `#email`
   - `#password`
   - `#confirmPassword`

### Test user already exists but can't login

**Error:** "Invalid credentials"

**Fix:**
1. Delete the user from your database
2. Delete auth state: `rm tests/.auth/user.json`
3. Run tests again: `npm test`

### Auth state is stale

**Symptom:** Tests fail with "Not authenticated" errors

**Fix:**
```bash
# Delete auth state and regenerate
rm tests/.auth/user.json
npm test
```

### Want to see auth setup running

```bash
# Run just the setup in headed mode
npx playwright test --project=setup --headed
```

## Architecture

```
┌─────────────────────────────────────┐
│  npm test                           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Setup Project Runs First           │
│  - tests/setup/auth.setup.ts        │
│  - Creates/Logs in test user        │
│  - Saves to tests/.auth/user.json   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Browser Projects Run                │
│  - Chromium (with auth)             │
│  - Firefox (with auth)              │
│  - WebKit (with auth)               │
│  - All load tests/.auth/user.json   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Your Tests Run                     │
│  - Already authenticated            │
│  - No login code needed             │
└─────────────────────────────────────┘
```

## Configuration

### playwright.config.ts

```typescript
projects: [
  // Setup runs first
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },

  // Browsers depend on setup
  {
    name: 'chromium',
    use: {
      storageState: 'tests/.auth/user.json', // ← Uses saved auth
    },
    dependencies: ['setup'], // ← Waits for setup
  },
  // ... same for firefox, webkit
]
```

### .gitignore

```
/tests/.auth/  ← Auth files not committed
```

## Best Practices

### ✅ Do:
- Let auth setup handle user creation
- Use the same test user for all tests
- Clear/recreate auth state if it gets corrupted
- Keep test user credentials simple

### ❌ Don't:
- Create users manually in tests
- Login in every test
- Commit `tests/.auth/` to git
- Use production credentials in tests
- Hardcode credentials in test files

## CI/CD Integration

Auth setup works in CI too:

```yaml
# GitHub Actions
- name: Run tests
  run: npm test
  # Auth setup creates user automatically
  # No manual DB setup needed
```

The setup script will:
1. Create test user in CI database
2. Save auth state
3. Run tests with authentication

## Multiple Test Users (Advanced)

If you need different user roles:

```typescript
// tests/setup/auth-admin.setup.ts
const ADMIN_USER = {
  email: 'playwright-admin@mechanicshop.com',
  password: 'AdminPassword123!',
};
// Save to tests/.auth/admin.json

// tests/setup/auth-staff.setup.ts
const STAFF_USER = {
  email: 'playwright-staff@mechanicshop.com',
  password: 'StaffPassword123!',
};
// Save to tests/.auth/staff.json
```

Then in playwright.config.ts:

```typescript
projects: [
  { name: 'setup-admin', testMatch: /auth-admin\.setup\.ts/ },
  { name: 'setup-staff', testMatch: /auth-staff\.setup\.ts/ },

  {
    name: 'admin-tests',
    use: { storageState: 'tests/.auth/admin.json' },
    dependencies: ['setup-admin'],
    testMatch: /.*\.admin\.spec\.ts/,
  },

  {
    name: 'staff-tests',
    use: { storageState: 'tests/.auth/staff.json' },
    dependencies: ['setup-staff'],
    testMatch: /.*\.staff\.spec\.ts/,
  },
]
```

## Summary

🎉 **Authentication is now automatic!**

- ✅ Test user created automatically
- ✅ All tests start logged in
- ✅ No manual setup required
- ✅ Works in CI/CD
- ✅ Fast (auth state reused)

Just run `npm test` and everything works!
