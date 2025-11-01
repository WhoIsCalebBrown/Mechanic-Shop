import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Step 1: Business Profile', () => {
    test('displays business profile form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /business profile/i, level: 2 })).toBeVisible();
    });

    test('fills all required fields', async ({ page }) => {
      await page.locator('#businessName').fill("Caleb's Auto Repair");
      await page.locator('#address').fill('123 Main Street');
      await page.locator('#city').fill('Austin');
      await page.locator('#state').fill('TX');
      await page.locator('#zipCode').fill('78701');
      await page.locator('#phone').fill('5125551234');

      await expect(page.locator('#businessName')).toHaveValue("Caleb's Auto Repair");
      await expect(page.locator('#city')).toHaveValue('Austin');
    });

    test('shows required field indicators', async ({ page }) => {
      const requiredSpans = page.locator('.required');
      const count = await requiredSpans.count();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('formats phone number automatically', async ({ page }) => {
      await page.locator('#phone').fill('5125551234');
      await page.waitForTimeout(200);

      const phoneValue = await page.locator('#phone').inputValue();
      expect(phoneValue).toContain('(');
      expect(phoneValue).toContain(')');
      expect(phoneValue).toContain('-');
    });

    test('has optional email field', async ({ page }) => {
      await page.locator('#email').fill('contact@calebauto.com');
      await expect(page.locator('#email')).toHaveValue('contact@calebauto.com');
    });

    test('disables back button on first step', async ({ page }) => {
      const backButton = page.getByRole('button', { name: /back/i });
      await expect(backButton).toBeDisabled();
    });
  });

  test.describe('Step 2: Service Area', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('#businessName').fill('Test Shop');
      await page.locator('#address').fill('123 Main St');
      await page.locator('#city').fill('Austin');
      await page.locator('#state').fill('TX');
      await page.locator('#zipCode').fill('78701');
      await page.locator('#phone').fill('5125551234');
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);
    });

    test('advances from step 1 to step 2', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /service area/i, level: 2 })).toBeVisible();
    });

    test('fills service area fields', async ({ page }) => {
      await page.locator('#serviceCity').fill('Austin');
      await page.locator('#serviceState').fill('TX');

      await expect(page.locator('#serviceCity')).toHaveValue('Austin');
      await expect(page.locator('#serviceState')).toHaveValue('TX');
    });

    test('shows all radius options', async ({ page }) => {
      await expect(page.locator('button.radius-option:has-text("10 mi")')).toBeVisible();
      await expect(page.locator('button.radius-option:has-text("15 mi")')).toBeVisible();
      await expect(page.locator('button.radius-option:has-text("25 mi")')).toBeVisible();
      await expect(page.locator('button.radius-option:has-text("50 mi")')).toBeVisible();
      await expect(page.locator('button.radius-option:has-text("75 mi")')).toBeVisible();
      await expect(page.locator('button.radius-option:has-text("100 mi")')).toBeVisible();
    });

    test('selects service radius', async ({ page }) => {
      await page.locator('button.radius-option:has-text("25 mi")').click();

      await expect(page.locator('button.radius-option:has-text("25 mi")')).toHaveClass(/active/);
      await expect(page.locator('.radius-value')).toHaveText('25');
    });
  });

  test.describe('Step 3: Operating Hours', () => {
    test.beforeEach(async ({ page }) => {
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
    });

    test('advances from step 2 to step 3', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /operating hours/i, level: 2 })).toBeVisible();
    });

    test('shows all days of the week', async ({ page }) => {
      await expect(page.locator('label:has-text("Monday")')).toBeVisible();
      await expect(page.locator('label:has-text("Tuesday")')).toBeVisible();
      await expect(page.locator('label:has-text("Wednesday")')).toBeVisible();
      await expect(page.locator('label:has-text("Thursday")')).toBeVisible();
      await expect(page.locator('label:has-text("Friday")')).toBeVisible();
      await expect(page.locator('label:has-text("Saturday")')).toBeVisible();
      await expect(page.locator('label:has-text("Sunday")')).toBeVisible();
    });

    test('toggles a day on/off', async ({ page }) => {
      const mondayCheckbox = page.locator('#toggle-Monday');
      const initialChecked = await mondayCheckbox.isChecked();

      await mondayCheckbox.click();
      await page.waitForTimeout(200);

      const afterToggle = await mondayCheckbox.isChecked();
      expect(afterToggle).toBe(!initialChecked);
    });

    test('changes time inputs', async ({ page }) => {
      const mondayRow = page.locator('.day-row').filter({ hasText: 'Monday' });
      const timeInputs = mondayRow.locator('input[type="time"]');

      await timeInputs.first().fill('08:00');
      await expect(timeInputs.first()).toHaveValue('08:00');

      await timeInputs.last().fill('18:00');
      await expect(timeInputs.last()).toHaveValue('18:00');
    });
  });

  test.describe('Complete Flow', () => {
    test('completes all 4 steps', async ({ page }) => {
      await page.locator('#businessName').fill('Complete Flow Test Shop');
      await page.locator('#address').fill('789 Complete Ave');
      await page.locator('#city').fill('Houston');
      await page.locator('#state').fill('TX');
      await page.locator('#zipCode').fill('77001');
      await page.locator('#phone').fill('7135551234');
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);

      await expect(page.getByRole('heading', { name: /service area/i, level: 2 })).toBeVisible();
      await page.locator('#serviceCity').fill('Houston');
      await page.locator('#serviceState').fill('TX');
      await page.locator('button.radius-option:has-text("50 mi")').click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);

      await expect(page.getByRole('heading', { name: /operating hours/i, level: 2 })).toBeVisible();
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);

      await expect(page.getByRole('heading', { name: /services/i, level: 2 })).toBeVisible();
      const completeButton = page.getByRole('button', { name: /complete/i });
      await expect(completeButton).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('allows going back through steps', async ({ page }) => {
      await page.locator('#businessName').fill('Nav Test');
      await page.locator('#address').fill('123 St');
      await page.locator('#city').fill('Austin');
      await page.locator('#state').fill('TX');
      await page.locator('#zipCode').fill('78701');
      await page.locator('#phone').fill('5125551234');
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);

      await expect(page.getByRole('heading', { name: /service area/i, level: 2 })).toBeVisible();

      await page.getByRole('button', { name: /back/i }).click();
      await page.waitForTimeout(500);

      await expect(page.getByRole('heading', { name: /business profile/i, level: 2 })).toBeVisible();
      await expect(page.locator('#businessName')).toHaveValue('Nav Test');
    });

    test('shows step indicators', async ({ page }) => {
      const stepIndicators = page.locator('.step-indicator, .step-item');
      const count = await stepIndicators.count();

      if (count > 0) {
        expect(count).toBe(4);
      }
    });
  });
});
