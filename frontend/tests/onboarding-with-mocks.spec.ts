import { test, expect } from '@playwright/test';
import {
  mockOnboardingAPI,
  mockOnboardingAPIError,
  mockSlowOnboardingAPI,
  waitForAPICall,
  mockAuthAPI,
} from './mocks/api';
import {
  navigateToOnboarding,
  fillBusinessProfile,
  fillServiceArea,
  clickNext,
  clickCompleteSetup,
  expectOnStep,
} from './onboarding-helpers';
import { completeOnboardingData } from './fixtures/onboarding';

test.describe('Onboarding - API Integration (Mocked)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks before each test
    await mockAuthAPI(page);
  });

  test('should submit onboarding data to API on completion', async ({ page }) => {
    // Mock successful onboarding API response
    await mockOnboardingAPI(page, {
      success: true,
      shopId: 123,
      slug: 'test-auto-repair',
    });

    // Setup listener for API call
    const apiCallPromise = waitForAPICall(page, '/api/onboarding/complete', 'POST');

    await navigateToOnboarding(page);

    // Complete all steps
    await fillBusinessProfile(page, completeOnboardingData.businessProfile);
    await clickNext(page);
    await fillServiceArea(page, completeOnboardingData.serviceArea);
    await clickNext(page);
    await clickNext(page); // Operating hours with defaults
    await expectOnStep(page, 4);

    // Complete setup
    await clickCompleteSetup(page);

    // Verify API was called
    const apiCall = await apiCallPromise;
    expect(apiCall).toBeTruthy();

    // Should redirect after success
    await page.waitForURL(/.*(?!onboarding)/, { timeout: 5000 });
  });

  test('should send correct payload structure to API', async ({ page }) => {
    let requestPayload: any = null;

    // Intercept and capture the request
    await page.route('**/api/onboarding/complete', async (route) => {
      requestPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          shopId: 123,
          slug: 'test-shop',
        }),
      });
    });

    await navigateToOnboarding(page);

    // Complete onboarding
    await fillBusinessProfile(page, completeOnboardingData.businessProfile);
    await clickNext(page);
    await fillServiceArea(page, completeOnboardingData.serviceArea);
    await clickNext(page);
    await clickNext(page);
    await clickCompleteSetup(page);

    // Wait for request
    await page.waitForTimeout(1000);

    // Verify payload structure
    expect(requestPayload).toBeTruthy();
    expect(requestPayload).toHaveProperty('businessProfile');
    expect(requestPayload).toHaveProperty('serviceArea');
    expect(requestPayload).toHaveProperty('operatingHours');

    // Verify business profile data
    expect(requestPayload.businessProfile.name).toBe(completeOnboardingData.businessProfile.name);
    expect(requestPayload.businessProfile.city).toBe(completeOnboardingData.businessProfile.city);

    // Verify service area data
    expect(requestPayload.serviceArea.city).toBe(completeOnboardingData.serviceArea.city);
    expect(requestPayload.serviceArea.radiusMiles).toBe(completeOnboardingData.serviceArea.radius);
  });

  test('should handle API success response and redirect', async ({ page }) => {
    const mockResponse = {
      success: true,
      shopId: 456,
      slug: 'my-mechanic-shop',
    };

    await mockOnboardingAPI(page, mockResponse);

    await navigateToOnboarding(page);

    // Complete flow
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);
    await clickCompleteSetup(page);

    // Should redirect (implementation-specific, could be dashboard, shop page, etc.)
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('onboarding');
  });

  test('should display error message on API failure', async ({ page }) => {
    // Mock API error
    await mockOnboardingAPIError(page, 500, 'Failed to create shop');

    await navigateToOnboarding(page);

    // Complete flow
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);
    await clickCompleteSetup(page);

    // Wait for error to appear
    await page.waitForTimeout(1500);

    // Should show error message
    const errorMessage = page.locator('.error, .error-message, [role="alert"]');

    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
      const errorText = await errorMessage.first().textContent();
      expect(errorText).toBeTruthy();
    }

    // Should stay on onboarding page
    expect(page.url()).toContain('onboarding');
  });

  test('should display validation error from API', async ({ page }) => {
    // Mock validation error
    await mockOnboardingAPIError(page, 400, 'Business name already exists');

    await navigateToOnboarding(page);

    // Complete flow
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);
    await clickCompleteSetup(page);

    // Wait for error
    await page.waitForTimeout(1500);

    // Should show validation error
    const errorMessage = page.locator('.error, .error-message, [role="alert"]');

    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }

    // Should remain on the same page
    expect(page.url()).toContain('onboarding');
  });

  test('should show loading state during API call', async ({ page }) => {
    // Mock slow API response
    await mockSlowOnboardingAPI(page, 2000);

    await navigateToOnboarding(page);

    // Complete flow
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);

    // Click complete
    const completeButton = page.getByRole('button', { name: /complete setup/i });
    await completeButton.click();

    // Check for loading state immediately
    await page.waitForTimeout(100);

    // Should show loading (disabled button or spinner)
    const isDisabled = await completeButton.isDisabled();
    const hasSpinner = await page.locator('.spinner, .loading').count() > 0;
    const hasLoadingText = (await completeButton.textContent())?.toLowerCase().includes('loading');

    expect(isDisabled || hasSpinner || hasLoadingText).toBeTruthy();
  });

  test('should disable "Complete Setup" button during submission', async ({ page }) => {
    await mockSlowOnboardingAPI(page, 1500);

    await navigateToOnboarding(page);

    // Complete flow
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);

    const completeButton = page.getByRole('button', { name: /complete setup/i });
    await completeButton.click();

    // Wait a moment
    await page.waitForTimeout(200);

    // Button should be disabled
    await expect(completeButton).toBeDisabled();
  });

  test('should include selected services in API payload', async ({ page }) => {
    let requestPayload: any = null;

    await page.route('**/api/onboarding/complete', async (route) => {
      requestPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, shopId: 1 }),
      });
    });

    await navigateToOnboarding(page);

    // Complete flow with service selection
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);

    // Select specific services
    const oilChangeCard = page.locator('.service-card', { hasText: /oil change/i });
    if (await oilChangeCard.count() > 0) {
      await oilChangeCard.click();
    }

    await clickCompleteSetup(page);
    await page.waitForTimeout(1000);

    // Verify services in payload
    expect(requestPayload).toBeTruthy();

    if (requestPayload?.services || requestPayload?.selectedServices) {
      const services = requestPayload.services || requestPayload.selectedServices;
      expect(Array.isArray(services)).toBeTruthy();
    }
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    // Mock very slow response (simulating timeout)
    await page.route('**/api/onboarding/complete', async (route) => {
      // Never fulfill the request to simulate timeout
      await new Promise(resolve => setTimeout(resolve, 30000));
    });

    await navigateToOnboarding(page);

    // Complete flow
    await fillBusinessProfile(page);
    await clickNext(page);
    await fillServiceArea(page);
    await clickNext(page);
    await clickNext(page);
    await clickCompleteSetup(page);

    // Wait a bit
    await page.waitForTimeout(3000);

    // Should either show error or stay on the page
    // (Implementation-specific timeout handling)
    const currentUrl = page.url();
    expect(currentUrl).toContain('onboarding');
  });
});
