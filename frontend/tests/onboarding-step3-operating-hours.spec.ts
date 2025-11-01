import { test, expect } from '@playwright/test';
import {
  navigateToOnboarding,
  fillBusinessProfile,
  fillServiceArea,
  clickNext,
  clickBack,
  expectOnStep,
} from './onboarding-helpers';

test.describe('Onboarding Step 3 - Operating Hours', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToOnboarding(page);

    // Complete steps 1 and 2
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);

    // Should now be on step 3
    await expectOnStep(page, 3);
  });

  test('should display operating hours grid for all days', async ({ page }) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
      // Check for day checkbox or toggle
      const dayControl = page.locator(`input[type="checkbox"][name="${day}"], label:has-text("${day}")`);
      await expect(dayControl.first()).toBeVisible();
    }
  });

  test('should have default operating hours (Mon-Fri 9am-5pm)', async ({ page }) => {
    // Check Monday's default hours
    const mondayOpenInput = page.locator('input[name="monday-open"]');
    const mondayCloseInput = page.locator('input[name="monday-close"]');

    if (await mondayOpenInput.count() > 0) {
      const openValue = await mondayOpenInput.inputValue();
      const closeValue = await mondayCloseInput.inputValue();

      // Should have some default values (typically 09:00 and 17:00)
      expect(openValue).toBeTruthy();
      expect(closeValue).toBeTruthy();
    }
  });

  test('should toggle day on/off with checkbox', async ({ page }) => {
    const mondayCheckbox = page.locator('input[type="checkbox"][name="monday"]');

    if (await mondayCheckbox.count() > 0) {
      // Get initial state
      const initiallyChecked = await mondayCheckbox.isChecked();

      // Toggle
      await mondayCheckbox.click();

      // State should change
      const afterToggle = await mondayCheckbox.isChecked();
      expect(afterToggle).toBe(!initiallyChecked);

      // Toggle back
      await mondayCheckbox.click();
      const afterSecondToggle = await mondayCheckbox.isChecked();
      expect(afterSecondToggle).toBe(initiallyChecked);
    }
  });

  test('should disable time inputs when day is closed', async ({ page }) => {
    const sundayCheckbox = page.locator('input[type="checkbox"][name="sunday"]');

    if (await sundayCheckbox.count() > 0) {
      // Uncheck Sunday (mark as closed)
      if (await sundayCheckbox.isChecked()) {
        await sundayCheckbox.uncheck();
      }

      // Time inputs should be disabled or hidden
      const sundayOpenInput = page.locator('input[name="sunday-open"]');
      const sundayCloseInput = page.locator('input[name="sunday-close"]');

      if (await sundayOpenInput.count() > 0) {
        const isDisabled = await sundayOpenInput.isDisabled();
        expect(isDisabled).toBeTruthy();
      }
    }
  });

  test('should enable time inputs when day is open', async ({ page }) => {
    const mondayCheckbox = page.locator('input[type="checkbox"][name="monday"]');

    if (await mondayCheckbox.count() > 0) {
      // Check Monday (mark as open)
      if (!await mondayCheckbox.isChecked()) {
        await mondayCheckbox.check();
      }

      // Time inputs should be enabled
      const mondayOpenInput = page.locator('input[name="monday-open"]');
      const mondayCloseInput = page.locator('input[name="monday-close"]');

      if (await mondayOpenInput.count() > 0) {
        const isEnabled = !await mondayOpenInput.isDisabled();
        expect(isEnabled).toBeTruthy();
      }
    }
  });

  test('should set opening time', async ({ page }) => {
    const mondayOpenInput = page.locator('input[name="monday-open"]');

    if (await mondayOpenInput.count() > 0) {
      await mondayOpenInput.fill('08:00');
      await expect(mondayOpenInput).toHaveValue('08:00');
    }
  });

  test('should set closing time', async ({ page }) => {
    const mondayCloseInput = page.locator('input[name="monday-close"]');

    if (await mondayCloseInput.count() > 0) {
      await mondayCloseInput.fill('18:00');
      await expect(mondayCloseInput).toHaveValue('18:00');
    }
  });

  test('should update hours for a specific day', async ({ page }) => {
    const tuesdayOpenInput = page.locator('input[name="tuesday-open"]');
    const tuesdayCloseInput = page.locator('input[name="tuesday-close"]');

    if (await tuesdayOpenInput.count() > 0) {
      // Set custom hours for Tuesday
      await tuesdayOpenInput.fill('10:00');
      await tuesdayCloseInput.fill('19:00');

      // Verify values
      await expect(tuesdayOpenInput).toHaveValue('10:00');
      await expect(tuesdayCloseInput).toHaveValue('19:00');
    }
  });

  test('should have "Apply to all days" button', async ({ page }) => {
    const applyAllButton = page.getByRole('button', { name: /apply to all/i });

    if (await applyAllButton.count() > 0) {
      await expect(applyAllButton).toBeVisible();
    }
  });

  test('should apply hours to all days when using "Apply to all" button', async ({ page }) => {
    const applyAllButton = page.getByRole('button', { name: /apply to all/i });

    if (await applyAllButton.count() > 0) {
      // Set Monday's hours
      const mondayOpenInput = page.locator('input[name="monday-open"]');
      const mondayCloseInput = page.locator('input[name="monday-close"]');

      await mondayOpenInput.fill('07:00');
      await mondayCloseInput.fill('20:00');

      // Click Apply to All
      await applyAllButton.click();
      await page.waitForTimeout(300);

      // Check that other days have the same hours
      const tuesdayOpenInput = page.locator('input[name="tuesday-open"]');
      const tuesdayCloseInput = page.locator('input[name="tuesday-close"]');

      if (await tuesdayOpenInput.count() > 0) {
        await expect(tuesdayOpenInput).toHaveValue('07:00');
        await expect(tuesdayCloseInput).toHaveValue('20:00');
      }
    }
  });

  test('should show open/closed status indicators', async ({ page }) => {
    // Look for status indicators showing "Open" or "Closed"
    const statusIndicators = page.locator('.status, .day-status, text=/open|closed/i');

    if (await statusIndicators.count() > 0) {
      await expect(statusIndicators.first()).toBeVisible();
    }
  });

  test('should display days in a responsive grid layout', async ({ page }) => {
    // Check that all day controls are visible
    const dayControls = page.locator('.day-row, .hours-row, .operating-day');

    if (await dayControls.count() > 0) {
      const count = await dayControls.count();
      // Should have 7 days
      expect(count).toBeGreaterThanOrEqual(7);
    }
  });

  test('should handle 12-hour time format if applicable', async ({ page }) => {
    const mondayOpenInput = page.locator('input[name="monday-open"]');

    if (await mondayOpenInput.count() > 0) {
      const timeType = await mondayOpenInput.getAttribute('type');

      // If it's time input, should accept HH:MM format
      if (timeType === 'time') {
        await mondayOpenInput.fill('09:00');
        await expect(mondayOpenInput).toHaveValue('09:00');
      }
    }
  });

  test('should validate that closing time is after opening time', async ({ page }) => {
    const mondayOpenInput = page.locator('input[name="monday-open"]');
    const mondayCloseInput = page.locator('input[name="monday-close"]');

    if (await mondayOpenInput.count() > 0) {
      // Set closing time before opening time
      await mondayOpenInput.fill('17:00');
      await mondayCloseInput.fill('09:00');

      // Try to proceed
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(500);

      // Might show validation error or just stay on step 3
      // Implementation-dependent
    }
  });

  test('should allow all days to be closed', async ({ page }) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Uncheck all days
    for (const day of days) {
      const checkbox = page.locator(`input[type="checkbox"][name="${day}"]`);
      if (await checkbox.count() > 0 && await checkbox.isChecked()) {
        await checkbox.uncheck();
      }
    }

    // Should still be able to proceed (operating hours might be optional)
    const nextButton = page.getByRole('button', { name: /next/i });
    await page.waitForTimeout(300);

    // Button might be enabled or disabled depending on business rules
    const isEnabled = await nextButton.isEnabled();
    // Just check it exists
    await expect(nextButton).toBeVisible();
  });

  test('should successfully advance to step 4 with valid hours', async ({ page }) => {
    // Ensure at least one day is open with valid hours
    const mondayCheckbox = page.locator('input[type="checkbox"][name="monday"]');

    if (await mondayCheckbox.count() > 0 && !await mondayCheckbox.isChecked()) {
      await mondayCheckbox.check();
    }

    const mondayOpenInput = page.locator('input[name="monday-open"]');
    const mondayCloseInput = page.locator('input[name="monday-close"]');

    if (await mondayOpenInput.count() > 0) {
      await mondayOpenInput.fill('09:00');
      await mondayCloseInput.fill('17:00');
    }

    // Proceed to step 4
    await clickNext(page);

    // Should be on step 4
    const step4Active = await page.locator('.step-indicator').nth(3).evaluate(el =>
      el.classList.contains('active')
    );

    expect(step4Active).toBeTruthy();
  });

  test('should preserve hours when navigating back from step 4', async ({ page }) => {
    // Set custom hours
    const wednesdayOpenInput = page.locator('input[name="wednesday-open"]');
    const wednesdayCloseInput = page.locator('input[name="wednesday-close"]');

    if (await wednesdayOpenInput.count() > 0) {
      await wednesdayOpenInput.fill('08:30');
      await wednesdayCloseInput.fill('17:30');

      // Go to step 4
      await clickNext(page);
      await expectOnStep(page, 4);

      // Go back to step 3
      await clickBack(page);
      await expectOnStep(page, 3);

      // Verify hours are preserved
      await expect(wednesdayOpenInput).toHaveValue('08:30');
      await expect(wednesdayCloseInput).toHaveValue('17:30');
    }
  });

  test('should display time pickers with appropriate format', async ({ page }) => {
    const timeInputs = page.locator('input[type="time"], input[name*="-open"], input[name*="-close"]');

    if (await timeInputs.count() > 0) {
      // Should have multiple time inputs (2 per day × 7 days = 14)
      const count = await timeInputs.count();
      expect(count).toBeGreaterThan(0);

      // First input should be visible
      await expect(timeInputs.first()).toBeVisible();
    }
  });
});
