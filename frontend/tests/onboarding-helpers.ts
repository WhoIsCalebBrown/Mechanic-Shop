import { Page, expect } from '@playwright/test';
import { testBusinessProfile, testServiceArea, testOperatingHours } from './fixtures/onboarding';

/**
 * Navigate to the onboarding page
 * Assumes user is already authenticated
 */
export async function navigateToOnboarding(page: Page) {
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');
}

/**
 * Check if we're on a specific onboarding step
 */
export async function expectOnStep(page: Page, stepNumber: number) {
  const stepIndicator = page.locator('.step-indicator').nth(stepNumber - 1);
  await expect(stepIndicator).toHaveClass(/active/);
}

/**
 * Fill out the Business Profile step (Step 1)
 */
export async function fillBusinessProfile(
  page: Page,
  data = testBusinessProfile,
  includeLogo = false
) {
  // Fill business name
  await page.getByLabel(/business name/i).fill(data.name);

  // Fill address
  await page.getByLabel(/street address/i).fill(data.street);
  await page.getByLabel(/city/i).fill(data.city);
  await page.getByLabel(/state/i).fill(data.state);
  await page.getByLabel(/zip code/i).fill(data.zip);

  // Fill phone number
  await page.getByLabel(/phone number/i).fill(data.phone);

  // Fill email if provided
  if (data.email) {
    const emailInput = page.getByLabel(/business email/i);
    if (await emailInput.count() > 0) {
      await emailInput.fill(data.email);
    }
  }

  // Upload logo if requested
  if (includeLogo) {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles('tests/fixtures/test-logo.svg');
    }
  }
}

/**
 * Fill out the Service Area step (Step 2)
 */
export async function fillServiceArea(page: Page, data = testServiceArea) {
  // Fill city
  await page.getByLabel(/city/i).fill(data.city);

  // Fill state
  await page.getByLabel(/state/i).fill(data.state);

  // Select radius
  const radiusButton = page.getByRole('button', { name: `${data.radius} miles` });
  await radiusButton.click();
}

/**
 * Configure operating hours (Step 3)
 */
export async function fillOperatingHours(page: Page, data = testOperatingHours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (const day of days) {
    const dayData = data[day as keyof typeof data];

    if (dayData && dayData.open && dayData.close) {
      // Make sure day is enabled
      const checkbox = page.locator(`input[type="checkbox"][name="${day}"]`);
      const isChecked = await checkbox.isChecked();

      if (!isChecked) {
        await checkbox.check();
      }

      // Fill open time
      await page.locator(`input[name="${day}-open"]`).fill(dayData.open);

      // Fill close time
      await page.locator(`input[name="${day}-close"]`).fill(dayData.close);
    } else {
      // Disable this day
      const checkbox = page.locator(`input[type="checkbox"][name="${day}"]`);
      const isChecked = await checkbox.isChecked();

      if (isChecked) {
        await checkbox.uncheck();
      }
    }
  }
}

/**
 * Select services (Step 4)
 */
export async function selectServices(page: Page, serviceNames: string[]) {
  for (const serviceName of serviceNames) {
    // Find the service card and click it
    const serviceCard = page.locator('.service-card', { hasText: serviceName });
    await serviceCard.click();

    // Verify it's selected
    await expect(serviceCard).toHaveClass(/selected/);
  }
}

/**
 * Click the Next button
 */
export async function clickNext(page: Page) {
  const nextButton = page.getByRole('button', { name: /next/i });
  await nextButton.click();
  await page.waitForTimeout(500); // Wait for transition
}

/**
 * Click the Back button
 */
export async function clickBack(page: Page) {
  const backButton = page.getByRole('button', { name: /back/i });
  await backButton.click();
  await page.waitForTimeout(500); // Wait for transition
}

/**
 * Click the Complete Setup button
 */
export async function clickCompleteSetup(page: Page) {
  const completeButton = page.getByRole('button', { name: /complete setup/i });
  await completeButton.click();
}

/**
 * Verify progress bar shows correct percentage
 */
export async function expectProgressPercentage(page: Page, percentage: number) {
  const progressFill = page.locator('.progress-fill');
  await expect(progressFill).toHaveCSS('width', `${percentage}%`);
}

/**
 * Complete entire onboarding flow
 */
export async function completeOnboardingFlow(page: Page) {
  // Step 1: Business Profile
  await expectOnStep(page, 1);
  await fillBusinessProfile(page);
  await clickNext(page);

  // Step 2: Service Area
  await expectOnStep(page, 2);
  await fillServiceArea(page);
  await clickNext(page);

  // Step 3: Operating Hours
  await expectOnStep(page, 3);
  await fillOperatingHours(page);
  await clickNext(page);

  // Step 4: Services
  await expectOnStep(page, 4);
  await selectServices(page, ['Oil Change', 'Tire Rotation']);
  await clickCompleteSetup(page);
}

/**
 * Verify step completion indicators
 */
export async function expectStepCompleted(page: Page, stepNumber: number) {
  const stepIndicator = page.locator('.step-indicator').nth(stepNumber - 1);
  await expect(stepIndicator).toHaveClass(/completed/);
}

/**
 * Check if Next button is disabled
 */
export async function expectNextButtonDisabled(page: Page) {
  const nextButton = page.getByRole('button', { name: /next/i });
  await expect(nextButton).toBeDisabled();
}

/**
 * Check if Next button is enabled
 */
export async function expectNextButtonEnabled(page: Page) {
  const nextButton = page.getByRole('button', { name: /next/i });
  await expect(nextButton).toBeEnabled();
}
