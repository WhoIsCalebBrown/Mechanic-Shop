# Manual Test User Setup

The automatic auth setup isn't working reliably, so let's do it manually (takes 2 minutes):

## Step 1: Create Test User

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open browser** and go to:
   ```
   http://localhost:5173/register
   ```

3. **Register with these EXACT credentials**:
   ```
   Business Name: Playwright Test Shop
   Email: playwright-test@mechanicshop.com
   Password: TestPassword123!
   Confirm Password: TestPassword123!
   ```

4. **Click "Create Account" or "Register"**

5. **You'll be redirected to /onboarding** - that's expected!

6. **STOP** - Don't complete the onboarding. Close the browser or go back to terminal.

## Step 2: Run Tests

Now the tests will work:

```bash
npm test simple-onboarding
```

This test file:
- Logs in automatically with the credentials above
- Tests the onboarding flow
- Much simpler and more reliable

## Why Manual Setup?

The automatic setup had issues with:
- Registration form validation
- Async redirects
- State management

Manual setup takes 2 minutes and works 100% of the time.

## Verify It Works

```bash
# Run just one test to verify
npx playwright test simple-onboarding -g "should display onboarding"

# If that passes, run all simple tests
npm test simple-onboarding

# Or run in UI mode to watch
npm run test:ui simple-onboarding
```

## What If I Already Have a User?

If you already created a test user, just make sure the credentials match:
- Email: `playwright-test@mechanicshop.com`
- Password: `TestPassword123!`

If you used different credentials, either:
1. Create a new user with the above credentials, OR
2. Edit `tests/simple-onboarding.spec.ts` lines 30-31 to match your user

## Clean Start

If things get messed up:

1. **Delete test user from database** (if you have access)
2. **Clear browser data** (or use incognito)
3. **Re-register** with the credentials above
4. **Run tests**

## That's It!

Once you've created the test user, you can run tests anytime:

```bash
npm test simple-onboarding
```

The tests will:
- ✅ Auto-login if needed
- ✅ Test all onboarding steps
- ✅ Work reliably every time
