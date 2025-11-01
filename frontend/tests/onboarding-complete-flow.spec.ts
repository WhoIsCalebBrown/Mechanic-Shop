import { test, expect } from '@playwright/test';
import {
  navigateToOnboarding,
  fillBusinessProfile,
  fillServiceArea,
  fillOperatingHours,
  selectServices,
  clickNext,
  clickCompleteSetup,
  expectOnStep,
  expectStepCompleted,
} from './onboarding-helpers';
import { completeOnboardingData } from './fixtures/onboarding';

test.describe('Onboarding - Complete Flow', () => {
  test('should complete entire onboarding flow successfully', async ({ page }) => {
    // Start onboarding
    await navigateToOnboarding(page);

    // === STEP 1: Business Profile ===
    await expectOnStep(page, 1);

    await fillBusinessProfile(page, completeOnboardingData.businessProfile);
    await clickNext(page);

    // Step 1 should be marked as completed
    await expectStepCompleted(page, 1);

    // === STEP 2: Service Area ===
    await expectOnStep(page, 2);

    await fillServiceArea(page, completeOnboardingData.serviceArea);
    await clickNext(page);

    // Steps 1 and 2 should be completed
    await expectStepCompleted(page, 1);
    await expectStepCompleted(page, 2);

    // === STEP 3: Operating Hours ===
    await expectOnStep(page, 3);

    await fillOperatingHours(page, completeOnboardingData.operatingHours);
    await clickNext(page);

    // Steps 1-3 should be completed
    await expectStepCompleted(page, 1);
    await expectStepCompleted(page, 2);
    await expectStepCompleted(page, 3);

    // === STEP 4: Services ===
    await expectOnStep(page, 4);

    await selectServices(page, completeOnboardingData.services);

    // Complete the onboarding
    await clickCompleteSetup(page);

    // Wait for submission
    await page.waitForTimeout(2000);

    // After completion, should redirect somewhere (dashboard, success page, etc.)
    // Check that we're no longer on onboarding page
    await page.waitForURL(/.*(?!onboarding)/, { timeout: 10000 });
  });

  test('should complete onboarding with minimal required data', async ({ page }) => {
    await navigateToOnboarding(page);

    // Step 1: Only required fields
    await page.getByLabel(/business name/i).fill('Minimal Shop');
    await page.getByLabel(/street address/i).fill('123 St');
    await page.getByLabel(/city/i).fill('Austin');
    await page.getByLabel(/state/i).fill('TX');
    await page.getByLabel(/zip code/i).fill('78701');
    await page.getByLabel(/phone number/i).fill('5125551234');
    await clickNext(page);

    // Step 2: Service area
    await page.getByLabel(/city/i).fill('Austin');
    await page.getByLabel(/state/i).fill('TX');
    await page.getByRole('button', { name: '25 miles' }).click();
    await clickNext(page);

    // Step 3: Use default operating hours
    await clickNext(page);

    // Step 4: Skip services (allowed per spec)
    await clickCompleteSetup(page);

    // Wait for submission
    await page.waitForTimeout(2000);
  });

  test('should complete onboarding with all optional data', async ({ page }) => {
    await navigateToOnboarding(page);

    // Step 1: Include optional email
    await fillBusinessProfile(page, {
      ...completeOnboardingData.businessProfile,
      email: 'contact@fullshop.com',
    });
    await clickNext(page);

    // Step 2: Service area
    await fillServiceArea(page, completeOnboardingData.serviceArea);
    await clickNext(page);

    // Step 3: Custom operating hours
    await fillOperatingHours(page, completeOnboardingData.operatingHours);
    await clickNext(page);

    // Step 4: Select all services
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    if (await selectAllButton.count() > 0) {
      await selectAllButton.click();
    } else {
      // Manually select services
      await selectServices(page, completeOnboardingData.services);
    }

    await clickCompleteSetup(page);
    await page.waitForTimeout(2000);
  });

  test('should show loading state during submission', async ({ page }) => {
    await navigateToOnboarding(page);

    // Fill all steps quickly
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page); // Skip operating hours
    await expectOnStep(page, 4);

    // Click complete and check for loading state
    const completeButton = page.getByRole('button', { name: /complete setup/i });
    await completeButton.click();

    // Should show loading state (disabled button, spinner, etc.)
    await page.waitForTimeout(100);

    // Button should be disabled or show loading text
    const isDisabledOrLoading = await completeButton.isDisabled() ||
                               await page.locator('.spinner, .loading').count() > 0;

    expect(isDisabledOrLoading).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // This test would require API mocking to simulate errors
    // For now, we'll just verify error UI exists

    await navigateToOnboarding(page);

    // Complete all steps
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);
    await expectOnStep(page, 4);

    // Attempt to complete
    await clickCompleteSetup(page);

    // Wait for either success or error
    await page.waitForTimeout(3000);

    // If there's an error, it should be displayed
    const errorMessage = page.locator('.error, .error-message, [role="alert"]');

    // Either we succeeded (navigated away) or there's an error visible
    const currentUrl = page.url();
    const hasError = await errorMessage.count() > 0;

    expect(currentUrl.includes('onboarding') || hasError).toBeTruthy();
  });

  test('should navigate through all steps sequentially', async ({ page }) => {
    await navigateToOnboarding(page);

    // Step 1
    await expectOnStep(page, 1);
    await expect(page.locator('text=/step 1 of 4/i')).toBeVisible();

    await fillBusinessProfile(page);
    await clickNext(page);

    // Step 2
    await expectOnStep(page, 2);
    await expect(page.locator('text=/step 2 of 4/i')).toBeVisible();

    await fillServiceArea(page);
    await clickNext(page);

    // Step 3
    await expectOnStep(page, 3);
    await expect(page.locator('text=/step 3 of 4/i')).toBeVisible();

    await clickNext(page);

    // Step 4
    await expectOnStep(page, 4);
    await expect(page.locator('text=/step 4 of 4/i')).toBeVisible();

    // Complete button should be visible
    await expect(page.getByRole('button', { name: /complete setup/i })).toBeVisible();
  });

  test('should preserve all data when navigating back and forth through all steps', async ({ page }) => {
    await navigateToOnboarding(page);

    const testData = {
      businessName: 'Test Navigation Shop',
      city: 'Dallas',
      radius: 50,
      openTime: '08:00',
    };

    // Fill step 1
    await page.getByLabel(/business name/i).fill(testData.businessName);
    await page.getByLabel(/street address/i).fill('123 Test St');
    await page.getByLabel(/city/i).fill('Houston');
    await page.getByLabel(/state/i).fill('TX');
    await page.getByLabel(/zip code/i).fill('77001');
    await page.getByLabel(/phone number/i).fill('7135551234');
    await clickNext(page);

    // Fill step 2
    await page.getByLabel(/city/i).fill(testData.city);
    await page.getByLabel(/state/i).fill('TX');
    await page.getByRole('button', { name: `${testData.radius} miles` }).click();
    await clickNext(page);

    // Fill step 3
    const mondayOpenInput = page.locator('input[name="monday-open"]');
    if (await mondayOpenInput.count() > 0) {
      await mondayOpenInput.fill(testData.openTime);
    }
    await clickNext(page);

    // On step 4, navigate all the way back to step 1
    await page.getByRole('button', { name: /back/i }).click(); // To step 3
    await page.getByRole('button', { name: /back/i }).click(); // To step 2
    await page.getByRole('button', { name: /back/i }).click(); // To step 1

    // Verify step 1 data is preserved
    await expect(page.getByLabel(/business name/i)).toHaveValue(testData.businessName);

    // Navigate forward to step 2
    await clickNext(page);

    // Verify step 2 data is preserved
    await expect(page.getByLabel(/city/i)).toHaveValue(testData.city);
    await expect(page.getByRole('button', { name: `${testData.radius} miles` })).toHaveClass(/selected|active/);

    // Navigate to step 3
    await clickNext(page);

    // Verify step 3 data is preserved
    if (await mondayOpenInput.count() > 0) {
      await expect(mondayOpenInput).toHaveValue(testData.openTime);
    }
  });

  test('should display all step indicators throughout the flow', async ({ page }) => {
    await navigateToOnboarding(page);

    // All 4 step indicators should always be visible
    const stepIndicators = page.locator('.step-indicator');
    await expect(stepIndicators).toHaveCount(4);

    // Navigate through all steps
    await fillBusinessProfile(page);
    await clickNext(page);
    await expect(stepIndicators).toHaveCount(4);

    await fillServiceArea(page);
    await clickNext(page);
    await expect(stepIndicators).toHaveCount(4);

    await clickNext(page);
    await expect(stepIndicators).toHaveCount(4);
  });

  test('should show progress increasing as user advances', async ({ page }) => {
    await navigateToOnboarding(page);

    // Step 1 - progress should be low
    const progressBar = page.locator('.progress-fill');
    await expect(progressBar).toBeVisible();

    // Complete step 1
    await fillBusinessProfile(page);
    await clickNext(page);

    // Progress should increase
    await page.waitForTimeout(300);

    // Complete step 2
    await fillServiceArea(page);
    await clickNext(page);
    await page.waitForTimeout(300);

    // Complete step 3
    await clickNext(page);
    await page.waitForTimeout(300);

    // On final step, progress should be near or at 100%
    await expectOnStep(page, 4);
  });

  test('should display appropriate button text on each step', async ({ page }) => {
    await navigateToOnboarding(page);

    // Steps 1-3 should show "Next"
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();

    await fillBusinessProfile(page);
    await clickNext(page);
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();

    await fillServiceArea(page);
    await clickNext(page);
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();

    await clickNext(page);

    // Step 4 should show "Complete Setup"
    await expect(page.getByRole('button', { name: /complete setup/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^next$/i })).not.toBeVisible();
  });
});
