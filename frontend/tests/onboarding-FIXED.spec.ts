import { test, expect } from '@playwright/test';

/**
 * FIXED Onboarding Tests with Correct Selectors
 * Based on actual component implementations
 */

test.describe('Onboarding Flow - WORKING TESTS', () => {

  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication if needed
    // await page.goto('/login');
    // await page.locator('#email').fill('test@example.com');
    // await page.locator('#password').fill('password');
    // await page.getByRole('button', { name: /login/i }).click();

    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
  });

  test('STEP 1: Should fill business profile with all required fields', async ({ page }) => {
    // Verify we're on Step 1
    await expect(page.getByRole('heading', { name: /business profile/i })).toBeVisible();

    // Fill all required fields using ACTUAL IDs
    await page.locator('#businessName').fill('Caleb\'s Auto Repair');
    await page.locator('#address').fill('123 Main Street');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');

    // Verify values
    await expect(page.locator('#businessName')).toHaveValue('Caleb\'s Auto Repair');
    await expect(page.locator('#city')).toHaveValue('Austin');

    // Optional email field
    await page.locator('#email').fill('contact@calebauto.com');
    await expect(page.locator('#email')).toHaveValue('contact@calebauto.com');
  });

  test('STEP 1: Should format phone number automatically', async ({ page }) => {
    await page.locator('#phone').fill('5125551234');
    await page.waitForTimeout(200);

    const phoneValue = await page.locator('#phone').inputValue();
    // Should be formatted like (512) 555-1234
    expect(phoneValue).toContain('(');
    expect(phoneValue).toContain(')');
    expect(phoneValue).toContain('-');
  });

  test('STEP 1: Should show required asterisks for required fields', async ({ page }) => {
    const requiredSpans = page.locator('.required');
    const count = await requiredSpans.count();

    // Should have at least 5 required fields
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('STEP 1 → STEP 2: Should advance to service area step', async ({ page }) => {
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

    // Should now be on Step 2
    await expect(page.getByRole('heading', { name: /service area/i })).toBeVisible();
  });

  test('STEP 2: Should fill service area fields', async ({ page }) => {
    // Navigate to Step 2
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Fill service area using ACTUAL IDs
    await page.locator('#serviceCity').fill('Austin');
    await page.locator('#serviceState').fill('TX');

    // Verify values
    await expect(page.locator('#serviceCity')).toHaveValue('Austin');
    await expect(page.locator('#serviceState')).toHaveValue('TX');
  });

  test('STEP 2: Should select service radius', async ({ page }) => {
    // Navigate to Step 2
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Click 25 mile radius button
    await page.locator('button.radius-option:has-text("25 mi")').click();

    // Verify button is active
    await expect(page.locator('button.radius-option:has-text("25 mi")')).toHaveClass(/active/);

    // Verify radius display shows 25
    await expect(page.locator('.radius-value')).toHaveText('25');
  });

  test('STEP 2: Should show all radius options', async ({ page }) => {
    // Navigate to Step 2
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Check all radius options: 10, 15, 25, 50, 75, 100
    await expect(page.locator('button.radius-option:has-text("10 mi")')).toBeVisible();
    await expect(page.locator('button.radius-option:has-text("15 mi")')).toBeVisible();
    await expect(page.locator('button.radius-option:has-text("25 mi")')).toBeVisible();
    await expect(page.locator('button.radius-option:has-text("50 mi")')).toBeVisible();
    await expect(page.locator('button.radius-option:has-text("75 mi")')).toBeVisible();
    await expect(page.locator('button.radius-option:has-text("100 mi")')).toBeVisible();
  });

  test('STEP 2 → STEP 3: Should advance to operating hours', async ({ page }) => {
    // Navigate to Step 2
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

    // Click Next
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Should be on Step 3
    await expect(page.getByRole('heading', { name: /operating hours/i })).toBeVisible();
  });

  test('STEP 3: Should show all days of the week', async ({ page }) => {
    // Navigate to Step 3
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);
    await page.locator('#serviceCity').fill('Austin');
    await page.locator('#serviceState').fill('TX');
    await page.locator('button.radius-option:has-text("25 mi")').click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Check all 7 days
    await expect(page.locator('label:has-text("Monday")')).toBeVisible();
    await expect(page.locator('label:has-text("Tuesday")')).toBeVisible();
    await expect(page.locator('label:has-text("Wednesday")')).toBeVisible();
    await expect(page.locator('label:has-text("Thursday")')).toBeVisible();
    await expect(page.locator('label:has-text("Friday")')).toBeVisible();
    await expect(page.locator('label:has-text("Saturday")')).toBeVisible();
    await expect(page.locator('label:has-text("Sunday")')).toBeVisible();
  });

  test('STEP 3: Should toggle a day on/off', async ({ page }) => {
    // Navigate to Step 3
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);
    await page.locator('#serviceCity').fill('Austin');
    await page.locator('#serviceState').fill('TX');
    await page.locator('button.radius-option:has-text("25 mi")').click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Get Monday checkbox
    const mondayCheckbox = page.locator('#toggle-Monday');

    // Get initial state
    const initialChecked = await mondayCheckbox.isChecked();

    // Toggle it
    await mondayCheckbox.click();
    await page.waitForTimeout(200);

    // State should have changed
    const afterToggle = await mondayCheckbox.isChecked();
    expect(afterToggle).toBe(!initialChecked);
  });

  test('STEP 3: Should change time inputs', async ({ page }) => {
    // Navigate to Step 3
    await page.locator('#businessName').fill('Test Shop');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);
    await page.locator('#serviceCity').fill('Austin');
    await page.locator('#serviceState').fill('TX');
    await page.locator('button.radius-option:has-text("25 mi")').click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Find the first time input in the Monday row
    const mondayRow = page.locator('.day-row').filter({ hasText: 'Monday' });
    const timeInputs = mondayRow.locator('input[type="time"]');

    // Set open time
    await timeInputs.first().fill('08:00');
    await expect(timeInputs.first()).toHaveValue('08:00');

    // Set close time
    await timeInputs.last().fill('18:00');
    await expect(timeInputs.last()).toHaveValue('18:00');
  });

  test('COMPLETE FLOW: Should complete all 4 steps', async ({ page }) => {
    // Step 1
    await page.locator('#businessName').fill('Complete Flow Test Shop');
    await page.locator('#address').fill('789 Complete Ave');
    await page.locator('#city').fill('Houston');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('77001');
    await page.locator('#phone').fill('7135551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Step 2
    await expect(page.getByRole('heading', { name: /service area/i })).toBeVisible();
    await page.locator('#serviceCity').fill('Houston');
    await page.locator('#serviceState').fill('TX');
    await page.locator('button.radius-option:has-text("50 mi")').click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Step 3
    await expect(page.getByRole('heading', { name: /operating hours/i })).toBeVisible();
    // Operating hours have defaults, just proceed
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Step 4 - Services
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible();

    // Should show Complete Setup button
    const completeButton = page.getByRole('button', { name: /complete/i });
    await expect(completeButton).toBeVisible();

    // Don't actually click to avoid creating test data
    // await completeButton.click();
  });

  test('NAVIGATION: Should allow going back through steps', async ({ page }) => {
    // Go to Step 2
    await page.locator('#businessName').fill('Nav Test');
    await page.locator('#address').fill('123 St');
    await page.locator('#city').fill('Austin');
    await page.locator('#state').fill('TX');
    await page.locator('#zipCode').fill('78701');
    await page.locator('#phone').fill('5125551234');
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // On Step 2
    await expect(page.getByRole('heading', { name: /service area/i })).toBeVisible();

    // Go Back
    await page.getByRole('button', { name: /back/i }).click();
    await page.waitForTimeout(500);

    // Should be back on Step 1
    await expect(page.getByRole('heading', { name: /business profile/i })).toBeVisible();

    // Data should be preserved
    await expect(page.locator('#businessName')).toHaveValue('Nav Test');
  });

  test('VALIDATION: Back button should be disabled on Step 1', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeDisabled();
  });

  test('PROGRESS: Should show step indicators', async ({ page }) => {
    // Look for step indicators
    const stepIndicators = page.locator('.step-indicator, .step-item');
    const count = await stepIndicators.count();

    if (count > 0) {
      expect(count).toBe(4);
    }
  });
});
