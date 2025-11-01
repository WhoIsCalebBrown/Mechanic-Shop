import { test, expect } from '@playwright/test';

/**
 * SIMPLE Onboarding Tests
 *
 * IMPORTANT: You need to manually create a test user first:
 * 1. Go to http://localhost:5173/register
 * 2. Register with:
 *    - Email: playwright-test@mechanicshop.com
 *    - Password: TestPassword123!
 *    - Business: Playwright Test Shop
 * 3. Then run these tests
 */

test.describe('Onboarding - Simple Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Try to go to onboarding
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Check if we got redirected to login (not authenticated)
    if (page.url().includes('/login')) {
      // Login
      await page.locator('#email').fill('playwright-test@mechanicshop.com');
      await page.locator('#password').fill('TestPassword123!');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);

      // Go to onboarding again
      await page.goto('/onboarding');
      await page.waitForLoadState('networkidle');
    }

    // Verify we're on onboarding (not login)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error(`
❌ Cannot access onboarding page - redirected to login.

Please manually create the test user:
1. Open http://localhost:5173/register
2. Register with:
   Email: playwright-test@mechanicshop.com
   Password: TestPassword123!
   Business: Playwright Test Shop
3. Then run tests again
      `);
    }
  });

  test('should display onboarding page', async ({ page }) => {
    // We're on onboarding, check for expected heading
    const heading = page.getByRole('heading', { name: /business profile|business info/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('Step 1: Fill business profile fields', async ({ page }) => {
    // Fill required fields
    await page.locator('#businessName').fill('Test Auto Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');

    // Verify
    await expect(page.locator('#businessName')).toHaveValue('Test Auto Shop');
    await expect(page.locator('#city')).toHaveValue('Austin');
  });

  test('Step 1 → Step 2: Advance to service area', async ({ page }) => {
    // Fill Step 1
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Dallas');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('75201');
    await page.locator('#phone').fill('2145551234');

    // Click Next
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Should be on Step 2
    const serviceAreaHeading = page.getByRole('heading', { name: /service area/i });
    await expect(serviceAreaHeading).toBeVisible();
  });

  test('Step 2: Fill service area', async ({ page }) => {
    // Navigate to Step 2 first
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Fill Step 2
    await page.locator('#serviceCity').fill('Austin');
    await page.locator('#serviceState').fill('TX');
    await page.locator('button.radius-option:has-text("25 mi")').click();

    // Verify
    await expect(page.locator('#serviceCity')).toHaveValue('Austin');
    await expect(page.locator('button.radius-option:has-text("25 mi")')).toHaveClass(/active/);
  });
});
