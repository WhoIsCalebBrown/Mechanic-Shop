# Playwright Tests - Quick Start (2 Minutes)

## TL;DR

1. **Create test user** (one time, 1 minute):
   - Go to http://localhost:5173/register
   - Email: `playwright-test@mechanicshop.com`
   - Password: `TestPassword123!`
   - Business: `Playwright Test Shop`

2. **Run tests**:
   ```bash
   npm test simple-onboarding
   ```

Done! ✅

---

## Detailed Steps

### 1. Start Dev Server

```bash
npm run dev
```

Leave it running.

### 2. Create Test User (One Time)

Open http://localhost:5173/register and register with:

| Field | Value |
|-------|-------|
| Business Name | Playwright Test Shop |
| Email | playwright-test@mechanicshop.com |
| Password | TestPassword123! |
| Confirm Password | TestPassword123! |

Click "Register" or "Create Account".

You'll be redirected to `/onboarding` - that's fine, just close the browser.

### 3. Run Tests

```bash
# Run the simple onboarding tests
npm test simple-onboarding

# Or watch in UI mode
npm run test:ui simple-onboarding

# Or watch in browser
npm run test:headed simple-onboarding
```

## What Gets Tested

✅ **Step 1: Business Profile**
- Fill all required fields (#businessName, #address, #city, #state, #zipCode, #phone)
- Phone auto-formatting
- Navigate to Step 2

✅ **Step 2: Service Area**
- Fill service city/state
- Select radius (25 mi)
- Verify selections

✅ **Step 3-4: Coming Soon**
- Operating hours tests
- Services tests
- Complete flow

## Files

- **`tests/simple-onboarding.spec.ts`** - The working tests
- **`tests/MANUAL_SETUP.md`** - Detailed setup instructions

## Why Manual Setup?

The automatic auth setup had reliability issues. Manual setup:
- Takes 1 minute
- Works 100% of the time
- You only do it once

## Troubleshooting

### "Cannot access onboarding page"

The test will tell you to create the user. Just follow Step 2 above.

### "Email already exists"

Good! Your test user is already created. Just run the tests:
```bash
npm test simple-onboarding
```

### Tests still fail

Make sure:
1. Dev server is running: `npm run dev`
2. Backend is running
3. You can manually access http://localhost:5173/onboarding

## Next Steps

Once simple tests pass:
1. Add more test scenarios
2. Test Operating Hours (Step 3)
3. Test Services (Step 4)
4. Test complete onboarding flow

## Full Documentation

- **`tests/MANUAL_SETUP.md`** - Detailed setup
- **`tests/README.md`** - Full testing guide
- **`tests/simple-onboarding.spec.ts`** - Test file (use as template)

---

**Quick command**: `npm test simple-onboarding` 🚀
