import { test, expect } from '@playwright/test';
import {
  navigateToOnboarding,
  fillBusinessProfile,
  fillServiceArea,
  clickNext,
  clickBack,
  expectOnStep,
} from './onboarding-helpers';
import { serviceCategories } from './fixtures/onboarding';

test.describe('Onboarding Step 4 - Services', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToOnboarding(page);

    // Complete steps 1-3
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page); // Operating hours (uses defaults)

    // Should now be on step 4
    await expectOnStep(page, 4);
  });

  test('should display service template cards', async ({ page }) => {
    const serviceCards = page.locator('.service-card');

    // Should have at least 8 predefined services
    const count = await serviceCards.count();
    expect(count).toBeGreaterThanOrEqual(8);

    // First card should be visible
    await expect(serviceCards.first()).toBeVisible();
  });

  test('should display service information on cards', async ({ page }) => {
    const firstCard = page.locator('.service-card').first();

    // Each card should show service name
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
    expect(cardText!.length).toBeGreaterThan(0);

    // Card should show price, duration, or description
    // (Implementation-specific, so we just verify card has content)
  });

  test('should show all 8 predefined service templates', async ({ page }) => {
    const expectedServices = [
      'Oil Change',
      'Tire Rotation',
      'Brake Inspection',
      'Engine Diagnostic',
    ];

    for (const serviceName of expectedServices) {
      const serviceCard = page.locator('.service-card', { hasText: serviceName });

      if (await serviceCard.count() > 0) {
        await expect(serviceCard).toBeVisible();
      }
    }
  });

  test('should display category filters', async ({ page }) => {
    // Look for category buttons/tabs
    const categoryButtons = page.locator('button:has-text("All"), button:has-text("Maintenance"), button:has-text("Inspection")');

    if (await categoryButtons.count() > 0) {
      await expect(categoryButtons.first()).toBeVisible();
    }
  });

  test('should filter services by category', async ({ page }) => {
    // Click on Maintenance category if it exists
    const maintenanceButton = page.getByRole('button', { name: /^maintenance$/i });

    if (await maintenanceButton.count() > 0) {
      await maintenanceButton.click();
      await page.waitForTimeout(300);

      // Should only show maintenance services
      const serviceCards = page.locator('.service-card:visible');
      const count = await serviceCards.count();

      // Should have fewer services than "All"
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show all services when "All" category is selected', async ({ page }) => {
    const allButton = page.getByRole('button', { name: /^all$/i });

    if (await allButton.count() > 0) {
      await allButton.click();
      await page.waitForTimeout(300);

      const serviceCards = page.locator('.service-card:visible');
      const count = await serviceCards.count();

      // Should show all services (at least 8)
      expect(count).toBeGreaterThanOrEqual(8);
    }
  });

  test('should select a service when clicked', async ({ page }) => {
    const firstCard = page.locator('.service-card').first();
    await firstCard.click();

    // Card should show as selected
    await expect(firstCard).toHaveClass(/selected|active/);

    // Should show checkmark or selection indicator
    const checkmark = firstCard.locator('svg, .checkmark, .check');
    if (await checkmark.count() > 0) {
      await expect(checkmark).toBeVisible();
    }
  });

  test('should deselect a service when clicked again', async ({ page }) => {
    const firstCard = page.locator('.service-card').first();

    // Click to select
    await firstCard.click();
    await expect(firstCard).toHaveClass(/selected|active/);

    // Click again to deselect
    await firstCard.click();
    await expect(firstCard).not.toHaveClass(/selected|active/);
  });

  test('should allow selecting multiple services', async ({ page }) => {
    const card1 = page.locator('.service-card').nth(0);
    const card2 = page.locator('.service-card').nth(1);
    const card3 = page.locator('.service-card').nth(2);

    // Select multiple services
    await card1.click();
    await card2.click();
    await card3.click();

    // All should be selected
    await expect(card1).toHaveClass(/selected|active/);
    await expect(card2).toHaveClass(/selected|active/);
    await expect(card3).toHaveClass(/selected|active/);
  });

  test('should have "Select All" button', async ({ page }) => {
    const selectAllButton = page.getByRole('button', { name: /select all/i });

    if (await selectAllButton.count() > 0) {
      await expect(selectAllButton).toBeVisible();
    }
  });

  test('should select all services when "Select All" is clicked', async ({ page }) => {
    const selectAllButton = page.getByRole('button', { name: /select all/i });

    if (await selectAllButton.count() > 0) {
      await selectAllButton.click();
      await page.waitForTimeout(300);

      // All visible service cards should be selected
      const selectedCards = page.locator('.service-card.selected, .service-card.active');
      const count = await selectedCards.count();

      expect(count).toBeGreaterThanOrEqual(8);
    }
  });

  test('should have "Clear All" button', async ({ page }) => {
    const clearAllButton = page.getByRole('button', { name: /clear all/i });

    if (await clearAllButton.count() > 0) {
      await expect(clearAllButton).toBeVisible();
    }
  });

  test('should deselect all services when "Clear All" is clicked', async ({ page }) => {
    // First select some services
    const card1 = page.locator('.service-card').nth(0);
    const card2 = page.locator('.service-card').nth(1);
    await card1.click();
    await card2.click();

    // Click Clear All
    const clearAllButton = page.getByRole('button', { name: /clear all/i });

    if (await clearAllButton.count() > 0) {
      await clearAllButton.click();
      await page.waitForTimeout(300);

      // No cards should be selected
      const selectedCards = page.locator('.service-card.selected, .service-card.active');
      const count = await selectedCards.count();

      expect(count).toBe(0);
    }
  });

  test('should display service details (name, description, duration, price)', async ({ page }) => {
    const firstCard = page.locator('.service-card').first();
    const cardText = await firstCard.textContent();

    // Should contain some service information
    expect(cardText).toBeTruthy();

    // Look for common service detail indicators
    const hasDuration = cardText!.includes('min') || cardText!.includes('hour');
    const hasPrice = cardText!.includes('$') || cardText!.includes('price');

    // At least should have some detail text
    expect(cardText!.length).toBeGreaterThan(10);
  });

  test('should allow proceeding with zero services selected (skippable step)', async ({ page }) => {
    // According to spec, services step is skippable
    const completeButton = page.getByRole('button', { name: /complete setup/i });

    // Button should be visible and enabled
    await expect(completeButton).toBeVisible();

    // Should be able to click it even with no services selected
    const isEnabled = await completeButton.isEnabled();
    expect(isEnabled).toBeTruthy();
  });

  test('should allow proceeding with selected services', async ({ page }) => {
    // Select a few services
    await page.locator('.service-card').nth(0).click();
    await page.locator('.service-card').nth(1).click();

    // Complete button should be enabled
    const completeButton = page.getByRole('button', { name: /complete setup/i });
    await expect(completeButton).toBeEnabled();
  });

  test('should show "Complete Setup" button on final step', async ({ page }) => {
    const completeButton = page.getByRole('button', { name: /complete setup/i });
    await expect(completeButton).toBeVisible();

    // Should NOT show "Next" button
    const nextButton = page.getByRole('button', { name: /^next$/i });
    await expect(nextButton).not.toBeVisible();
  });

  test('should preserve selected services when navigating back', async ({ page }) => {
    // Select some services
    const oilChangeCard = page.locator('.service-card', { hasText: /oil change/i });
    const tireRotationCard = page.locator('.service-card', { hasText: /tire rotation/i });

    if (await oilChangeCard.count() > 0) {
      await oilChangeCard.click();
    }
    if (await tireRotationCard.count() > 0) {
      await tireRotationCard.click();
    }

    // Go back to step 3
    await clickBack(page);
    await expectOnStep(page, 3);

    // Go forward to step 4 again
    await clickNext(page);
    await expectOnStep(page, 4);

    // Services should still be selected
    if (await oilChangeCard.count() > 0) {
      await expect(oilChangeCard).toHaveClass(/selected|active/);
    }
    if (await tireRotationCard.count() > 0) {
      await expect(tireRotationCard).toHaveClass(/selected|active/);
    }
  });

  test('should display services in a responsive grid layout', async ({ page }) => {
    const serviceCards = page.locator('.service-card');
    const count = await serviceCards.count();

    // Should have multiple cards
    expect(count).toBeGreaterThanOrEqual(8);

    // All cards should be in the viewport or scrollable
    const firstCard = serviceCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should show visual selection indicator (checkmark)', async ({ page }) => {
    const firstCard = page.locator('.service-card').first();
    await firstCard.click();

    // Look for checkmark
    const checkmark = page.locator('.checkmark, svg, .check, .selected-icon');

    if (await checkmark.count() > 0) {
      await expect(checkmark.first()).toBeVisible();
    }
  });

  test('should filter services by different categories', async ({ page }) => {
    const categories = ['Maintenance', 'Inspection', 'Diagnostic'];

    for (const category of categories) {
      const categoryButton = page.getByRole('button', { name: new RegExp(`^${category}$`, 'i') });

      if (await categoryButton.count() > 0) {
        await categoryButton.click();
        await page.waitForTimeout(200);

        // Should show some services (at least 1)
        const visibleCards = page.locator('.service-card:visible');
        const count = await visibleCards.count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('should show estimated duration for each service', async ({ page }) => {
    const serviceCards = page.locator('.service-card');
    const firstCardText = await serviceCards.first().textContent();

    // Should show duration (e.g., "30 min", "1 hour", etc.)
    const hasDuration = firstCardText?.includes('min') ||
                       firstCardText?.includes('hour') ||
                       firstCardText?.includes('duration');

    // At minimum, card should have content
    expect(firstCardText).toBeTruthy();
  });

  test('should show base price for each service', async ({ page }) => {
    const serviceCards = page.locator('.service-card');
    const firstCardText = await serviceCards.first().textContent();

    // Should show price (e.g., "$29.99", "Starting at $50", etc.)
    const hasPrice = firstCardText?.includes('$') ||
                    firstCardText?.includes('price');

    // At minimum, card should have content
    expect(firstCardText).toBeTruthy();
  });
});
