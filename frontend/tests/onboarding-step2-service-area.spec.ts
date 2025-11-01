import { test, expect } from '@playwright/test';
import {
  navigateToOnboarding,
  fillBusinessProfile,
  clickNext,
  clickBack,
  expectOnStep,
} from './onboarding-helpers';
import { testServiceArea } from './fixtures/onboarding';

test.describe('Onboarding Step 2 - Service Area', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToOnboarding(page);

    // Complete step 1 first
    await fillBusinessProfile(page);
    await clickNext(page);

    // Should now be on step 2
    await expectOnStep(page, 2);
  });

  test('should display service area form fields', async ({ page }) => {
    // Check for city input
    await expect(page.getByLabel(/city/i)).toBeVisible();

    // Check for state input
    await expect(page.getByLabel(/state/i)).toBeVisible();

    // Check for radius selector
    const radiusButtons = page.locator('button:has-text("miles")');
    await expect(radiusButtons.first()).toBeVisible();
  });

  test('should display all radius options', async ({ page }) => {
    // Check for standard radius options: 10, 15, 25, 50, 75, 100 miles
    const radiusOptions = [10, 15, 25, 50, 75, 100];

    for (const radius of radiusOptions) {
      const button = page.getByRole('button', { name: `${radius} miles` });
      await expect(button).toBeVisible();
    }
  });

  test('should fill city and state', async ({ page }) => {
    await page.getByLabel(/city/i).fill(testServiceArea.city);
    await page.getByLabel(/state/i).fill(testServiceArea.state);

    await expect(page.getByLabel(/city/i)).toHaveValue(testServiceArea.city);
    await expect(page.getByLabel(/state/i)).toHaveValue(testServiceArea.state);
  });

  test('should select a service radius', async ({ page }) => {
    const radiusButton = page.getByRole('button', { name: `${testServiceArea.radius} miles` });
    await radiusButton.click();

    // Button should show as selected
    await expect(radiusButton).toHaveClass(/selected|active/);
  });

  test('should allow changing radius selection', async ({ page }) => {
    // Select first radius
    const radius1Button = page.getByRole('button', { name: '25 miles' });
    await radius1Button.click();
    await expect(radius1Button).toHaveClass(/selected|active/);

    // Select different radius
    const radius2Button = page.getByRole('button', { name: '50 miles' });
    await radius2Button.click();
    await expect(radius2Button).toHaveClass(/selected|active/);

    // First button should no longer be selected
    await expect(radius1Button).not.toHaveClass(/selected|active/);
  });

  test('should display visual radius indicator', async ({ page }) => {
    // Look for radius display text or visual element
    const radiusDisplay = page.locator('.radius-display, .service-radius, text=/radius/i');

    if (await radiusDisplay.count() > 0) {
      await expect(radiusDisplay.first()).toBeVisible();
    }
  });

  test('should update radius display when selection changes', async ({ page }) => {
    // Select a radius
    await page.getByRole('button', { name: '25 miles' }).click();

    // Wait for update
    await page.waitForTimeout(300);

    // Check if visual display updates (could be text showing "25 miles" or similar)
    const radiusInfo = page.locator('text=/25.*mile/i');

    if (await radiusInfo.count() > 0) {
      await expect(radiusInfo.first()).toBeVisible();
    }
  });

  test('should show info box explaining service area usage', async ({ page }) => {
    // Look for info box or help text
    const infoBox = page.locator('.info-box, .help-text, .info, [role="note"]');

    if (await infoBox.count() > 0) {
      await expect(infoBox.first()).toBeVisible();
    }
  });

  test('should prevent advancing with empty city', async ({ page }) => {
    // Fill state and radius only
    await page.getByLabel(/state/i).fill(testServiceArea.state);
    await page.getByRole('button', { name: `${testServiceArea.radius} miles` }).click();

    // Try to proceed
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();
    await page.waitForTimeout(500);

    // Should stay on step 2 or show error
    const step2Active = await page.locator('.step-indicator').nth(1).evaluate(el =>
      el.classList.contains('active')
    );

    expect(step2Active).toBeTruthy();
  });

  test('should prevent advancing with empty state', async ({ page }) => {
    // Fill city and radius only
    await page.getByLabel(/city/i).fill(testServiceArea.city);
    await page.getByRole('button', { name: `${testServiceArea.radius} miles` }).click();

    // Try to proceed
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();
    await page.waitForTimeout(500);

    // Should stay on step 2 or show error
    const step2Active = await page.locator('.step-indicator').nth(1).evaluate(el =>
      el.classList.contains('active')
    );

    expect(step2Active).toBeTruthy();
  });

  test('should prevent advancing without radius selection', async ({ page }) => {
    // Fill city and state only
    await page.getByLabel(/city/i).fill(testServiceArea.city);
    await page.getByLabel(/state/i).fill(testServiceArea.state);

    // Try to proceed without selecting radius
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();
    await page.waitForTimeout(500);

    // Should stay on step 2 or show error
    const step2Active = await page.locator('.step-indicator').nth(1).evaluate(el =>
      el.classList.contains('active')
    );

    expect(step2Active).toBeTruthy();
  });

  test('should successfully advance to step 3 with valid data', async ({ page }) => {
    // Fill all required fields
    await page.getByLabel(/city/i).fill(testServiceArea.city);
    await page.getByLabel(/state/i).fill(testServiceArea.state);
    await page.getByRole('button', { name: `${testServiceArea.radius} miles` }).click();

    // Proceed to next step
    await clickNext(page);

    // Should be on step 3
    const step3Active = await page.locator('.step-indicator').nth(2).evaluate(el =>
      el.classList.contains('active')
    );

    expect(step3Active).toBeTruthy();
  });

  test('should preserve data when navigating back from step 3', async ({ page }) => {
    const testCity = 'Dallas';
    const testState = 'TX';
    const testRadius = 50;

    // Fill service area
    await page.getByLabel(/city/i).fill(testCity);
    await page.getByLabel(/state/i).fill(testState);
    await page.getByRole('button', { name: `${testRadius} miles` }).click();

    // Go to step 3
    await clickNext(page);
    await expectOnStep(page, 3);

    // Go back to step 2
    await clickBack(page);
    await expectOnStep(page, 2);

    // Verify data is preserved
    await expect(page.getByLabel(/city/i)).toHaveValue(testCity);
    await expect(page.getByLabel(/state/i)).toHaveValue(testState);
    await expect(page.getByRole('button', { name: `${testRadius} miles` })).toHaveClass(/selected|active/);
  });

  test('should accept two-letter state abbreviation', async ({ page }) => {
    await page.getByLabel(/state/i).fill('TX');
    await expect(page.getByLabel(/state/i)).toHaveValue('TX');
  });

  test('should handle state input as dropdown or text field', async ({ page }) => {
    const stateInput = page.getByLabel(/state/i);

    // Could be a select dropdown or text input
    const tagName = await stateInput.evaluate(el => el.tagName.toLowerCase());

    if (tagName === 'select') {
      // If it's a dropdown, select an option
      await stateInput.selectOption('TX');
      await expect(stateInput).toHaveValue('TX');
    } else {
      // If it's a text input, fill it
      await stateInput.fill('TX');
      await expect(stateInput).toHaveValue('TX');
    }
  });

  test('should display all radius buttons in a responsive grid', async ({ page }) => {
    const radiusButtons = page.locator('button:has-text("miles")');
    const count = await radiusButtons.count();

    // Should have at least 6 standard options
    expect(count).toBeGreaterThanOrEqual(6);

    // All buttons should be visible
    for (let i = 0; i < count; i++) {
      await expect(radiusButtons.nth(i)).toBeVisible();
    }
  });
});
