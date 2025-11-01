# Fixing the Playwright Tests

## What Happened

The initial tests I wrote were based on the documentation you provided, but they used generic selectors that didn't match your actual component implementation. That's why they all failed.

## The Fixed Version

I've created **`onboarding-FIXED.spec.ts`** with the correct selectors based on your actual code:

### Correct Field IDs (from your components):

**Step 1 - Business Profile:**
- `#businessName` - Business name input
- `#address` - Street address input
- `#city` - City input
- `#state` - State input
- `#zipCode` - ZIP code input
- `#phone` - Phone number input
- `#email` - Email input (optional)

**Step 2 - Service Area:**
- `#serviceCity` - City input
- `#serviceState` - State input
- `button.radius-option:has-text("25 mi")` - Radius buttons

**Step 3 - Operating Hours:**
- `#toggle-Monday`, `#toggle-Tuesday`, etc. - Day toggles
- `.day-row` - Day containers
- `input[type="time"]` - Time inputs

## Running the Fixed Tests

```bash
# Run only the fixed tests
npm test onboarding-FIXED

# Run in UI mode to see them work
npm run test:ui onboarding-FIXED

# Run in headed mode to watch
npm run test:headed onboarding-FIXED
```

## What You Need to Do

### 1. Add Authentication (if needed)

The onboarding page might require authentication. If so, uncomment and update this in the `beforeEach`:

```typescript
test.beforeEach(async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.locator('#email').fill('your-test-email@example.com');
  await page.locator('#password').fill('your-test-password');
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/dashboard|home/);

  // Then go to onboarding
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');
});
```

### 2. Update Login Selectors

Check your `LoginPage.tsx` to see what the actual field IDs are. You might need:

```typescript
await page.locator('#your-actual-email-id').fill('...');
await page.locator('#your-actual-password-id').fill('...');
```

### 3. Check ServicesStep

I haven't seen the ServicesStep component yet, so you'll need to add proper selectors for that step. Read the component:

```bash
# Check the actual implementation
cat frontend/src/components/onboarding/ServicesStep.tsx
```

Then add tests with the correct selectors.

## Deleting the Bad Tests

You can delete these files (they have wrong selectors):
- `auth.spec.ts`
- `example.spec.ts`
- `onboarding-wizard.spec.ts`
- `onboarding-step1-business-profile.spec.ts`
- `onboarding-step2-service-area.spec.ts`
- `onboarding-step3-operating-hours.spec.ts`
- `onboarding-step4-services.spec.ts`
- `onboarding-complete-flow.spec.ts`
- `onboarding-with-mocks.spec.ts`

Keep these:
- `onboarding-FIXED.spec.ts` ✅ (working tests)
- `onboarding-working.spec.ts` ✅ (simpler working tests)
- `helpers.ts` ✅ (helper functions)
- `onboarding-helpers.ts` (needs updates with correct selectors)
- `fixtures/onboarding.ts` ✅ (test data)
- `mocks/api.ts` ✅ (API mocking)

## How to Write Tests Going Forward

### 1. Always Check the Component First

Before writing a test, read the actual component file to find:
- Actual `id` attributes
- Actual `className` values
- Button text
- Label text

### 2. Use Playwright's Codegen

Generate tests automatically:

```bash
# Start the codegen tool
npx playwright codegen http://localhost:5173/onboarding
```

This opens a browser where you can:
1. Click through your app
2. Playwright records your actions
3. Copy the generated code with correct selectors

### 3. Test Incrementally

Don't write 100 tests at once. Write one test, make sure it passes, then write the next one.

```bash
# Run a single test
npm test onboarding-FIXED.spec.ts -g "Should fill business profile"

# Watch a single test
npm run test:ui onboarding-FIXED
```

### 4. Use page.pause() for Debugging

Add this in your test to pause and inspect:

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/onboarding');
  await page.pause(); // Pauses here, opens inspector
  // ... rest of test
});
```

## Example: How I Fixed It

**Before (wrong):**
```typescript
await page.getByLabel(/business name/i).fill('Test');
```

**After (correct):**
```typescript
await page.locator('#businessName').fill('Test');
```

The difference: I looked at `BusinessProfileStep.tsx` line 91 and saw `id="businessName"`.

## Quick Test to Verify Setup

Run this simple test first:

```bash
# Create a simple test file
cat > frontend/tests/simple-test.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('can load onboarding page', async ({ page }) => {
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'onboarding-page.png' });
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
});
EOF

# Run it
npm test simple-test
```

This will tell you if you can even reach the page or if auth is blocking you.

## Next Steps

1. **Run the fixed tests**: `npm run test:ui onboarding-FIXED`
2. **Check if auth is needed**: Look at the screenshot/error
3. **Add auth if needed**: Update the beforeEach
4. **Delete old tests**: Remove the files with wrong selectors
5. **Add Services step tests**: Once you verify the others work

## Need Help?

If tests still fail:

1. Run in headed mode: `npm run test:headed onboarding-FIXED`
2. Watch what happens in the browser
3. Add `await page.pause()` to stop and inspect
4. Check the actual DOM with browser devtools
5. Compare what you see vs what the test expects

The `onboarding-FIXED.spec.ts` file should work if:
- You can access `/onboarding` (with or without auth)
- The selectors match your components (they should, I read them)
- The page loads within timeouts

Let me know which test fails and I can help debug it!
