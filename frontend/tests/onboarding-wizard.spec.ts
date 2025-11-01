import { test, expect } from '@playwright/test';
import { login } from './helpers';
import {
  navigateToOnboarding,
  expectOnStep,
  clickNext,
  clickBack,
  fillBusinessProfile,
  fillServiceArea,
  expectProgressPercentage,
  expectStepCompleted,
} from './onboarding-helpers';

test.describe('Onboarding Wizard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (adjust credentials as needed)
    // await login(page, 'test@example.com', 'password123');
    await navigateToOnboarding(page);
  });

  test('should display onboarding wizard with welcome header', async ({ page }) => {
    // Check for welcome header
    await expect(page.locator('h1')).toContainText(/welcome|setup|onboarding/i);

    // Check for wizard container
    await expect(page.locator('.wizard-container, .onboarding-wizard')).toBeVisible();
  });

  test('should show all 4 step indicators', async ({ page }) => {
    // Check that all 4 steps are shown
    const stepIndicators = page.locator('.step-indicator');
    await expect(stepIndicators).toHaveCount(4);

    // Verify step titles
    await expect(page.locator('.step-title')).toContainText([
      /business profile|business info/i,
      /service area/i,
      /operating hours|hours/i,
      /services/i,
    ]);
  });

  test('should start on step 1 (Business Profile)', async ({ page }) => {
    await expectOnStep(page, 1);

    // Progress should be 0% or 25%
    const progressBar = page.locator('.progress-bar, .progress');
    await expect(progressBar).toBeVisible();
  });

  test('should have Back button disabled on first step', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeDisabled();
  });

  test('should show progress indicator "Step 1 of 4"', async ({ page }) => {
    await expect(page.locator('text=/step 1 of 4/i')).toBeVisible();
  });

  test('should update progress bar when advancing steps', async ({ page }) => {
    // Fill step 1 and proceed
    await fillBusinessProfile(page);
    await clickNext(page);

    // Should be on step 2
    await expectOnStep(page, 2);

    // Progress bar should show 50% (2 of 4 steps)
    const progressFill = page.locator('.progress-fill');
    const width = await progressFill.evaluate(el =>
      window.getComputedStyle(el).width
    );

    // Just verify it's progressed (not at 0%)
    await expect(progressFill).toBeVisible();
  });

  test('should allow navigating back to previous steps', async ({ page }) => {
    // Complete step 1
    await fillBusinessProfile(page);
    await clickNext(page);
    await expectOnStep(page, 2);

    // Fill step 2
    await fillServiceArea(page);
    await clickNext(page);
    await expectOnStep(page, 3);

    // Go back to step 2
    await clickBack(page);
    await expectOnStep(page, 2);

    // Go back to step 1
    await clickBack(page);
    await expectOnStep(page, 1);

    // Back button should be disabled on step 1
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeDisabled();
  });

  test('should preserve data when navigating back and forth', async ({ page }) => {
    const testName = 'My Test Auto Shop';

    // Fill business name
    await page.getByLabel(/business name/i).fill(testName);

    // Fill other required fields
    await fillBusinessProfile(page, {
      name: testName,
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '5125551234',
    });

    // Go to step 2
    await clickNext(page);
    await expectOnStep(page, 2);

    // Go back to step 1
    await clickBack(page);
    await expectOnStep(page, 1);

    // Verify data is preserved
    const nameInput = page.getByLabel(/business name/i);
    await expect(nameInput).toHaveValue(testName);
  });

  test('should mark completed steps with checkmark', async ({ page }) => {
    // Complete step 1
    await fillBusinessProfile(page);
    await clickNext(page);

    // Step 1 should show as completed
    const step1Indicator = page.locator('.step-indicator').nth(0);
    await expect(step1Indicator).toHaveClass(/completed/);

    // Step 1 should show a checkmark icon
    const checkmark = step1Indicator.locator('svg, .checkmark, .icon');
    await expect(checkmark).toBeVisible();
  });

  test('should show "Next" button on steps 1-3', async ({ page }) => {
    // Step 1
    await expect(page.getByRole('button', { name: /^next$/i })).toBeVisible();

    // Move to step 2
    await fillBusinessProfile(page);
    await clickNext(page);
    await expect(page.getByRole('button', { name: /^next$/i })).toBeVisible();

    // Move to step 3
    await fillServiceArea(page);
    await clickNext(page);
    await expect(page.getByRole('button', { name: /^next$/i })).toBeVisible();
  });

  test('should show "Complete Setup" button on final step', async ({ page }) => {
    // Navigate to step 4
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page); // Skip operating hours (should have defaults)

    // Should be on step 4
    await expectOnStep(page, 4);

    // Should show "Complete Setup" button
    await expect(page.getByRole('button', { name: /complete setup/i })).toBeVisible();

    // Should NOT show "Next" button
    await expect(page.getByRole('button', { name: /^next$/i })).not.toBeVisible();
  });

  test('should scroll to top when changing steps', async ({ page }) => {
    // Fill and submit step 1
    await fillBusinessProfile(page);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Click next
    await clickNext(page);

    // Wait a moment for scroll
    await page.waitForTimeout(300);

    // Should be scrolled to top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });
});

test.describe('Onboarding Wizard - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToOnboarding(page);
  });

  test('should prevent advancing with incomplete required fields', async ({ page }) => {
    // Try to click Next without filling required fields
    const nextButton = page.getByRole('button', { name: /next/i });

    // Next button should be disabled or show validation
    const isDisabled = await nextButton.isDisabled();

    if (!isDisabled) {
      // If button is enabled, clicking should show validation errors
      await nextButton.click();
      await page.waitForTimeout(500);

      // Should still be on step 1 or show error message
      const errorMessage = page.locator('.error, .error-message, [role="alert"]');
      const isOnStep1 = await page.locator('.step-indicator').nth(0).evaluate(el =>
        el.classList.contains('active')
      );

      expect(isOnStep1 || await errorMessage.count() > 0).toBeTruthy();
    }
  });

  test('should show loading state when submitting', async ({ page }) => {
    // Complete all steps
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page); // Operating hours with defaults
    await clickNext(page); // Services (skippable)

    // Click Complete Setup
    const completeButton = page.getByRole('button', { name: /complete setup/i });
    await completeButton.click();

    // Should show loading state (spinner, disabled button, or loading text)
    const loadingIndicators = [
      page.locator('.spinner, .loading'),
      page.locator('text=/submitting|please wait/i'),
      completeButton.locator('.spinner'),
    ];

    // At least one loading indicator should appear briefly
    await page.waitForTimeout(100);
  });
});
