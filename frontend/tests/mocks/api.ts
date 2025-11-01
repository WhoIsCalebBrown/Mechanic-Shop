import { Page } from '@playwright/test';

/**
 * Mock API responses for testing
 */

export interface MockOnboardingResponse {
  success: boolean;
  message?: string;
  shopId?: number;
  slug?: string;
}

/**
 * Setup API mocking for the onboarding endpoint
 */
export async function mockOnboardingAPI(
  page: Page,
  response: MockOnboardingResponse = { success: true, shopId: 1, slug: 'test-shop' }
) {
  await page.route('**/api/onboarding/complete', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Mock onboarding API to return an error
 */
export async function mockOnboardingAPIError(
  page: Page,
  status: number = 500,
  message: string = 'Internal server error'
) {
  await page.route('**/api/onboarding/complete', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message,
        error: message,
      }),
    });
  });
}

/**
 * Mock authentication endpoints for testing
 */
export async function mockAuthAPI(page: Page) {
  // Mock login endpoint
  await page.route('**/api/auth/login', async (route) => {
    const postData = route.request().postDataJSON();

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          email: postData.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'ShopOwner',
        },
      }),
    });
  });

  // Mock register endpoint
  await page.route('**/api/auth/register', async (route) => {
    const postData = route.request().postDataJSON();

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token-12345',
        user: {
          id: 2,
          email: postData.email,
          firstName: postData.firstName || 'Test',
          lastName: postData.lastName || 'User',
          role: 'ShopOwner',
        },
      }),
    });
  });

  // Mock token refresh endpoint
  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-refreshed-jwt-token-67890',
      }),
    });
  });
}

/**
 * Mock all API endpoints for isolated testing
 */
export async function mockAllAPIs(page: Page) {
  await mockAuthAPI(page);
  await mockOnboardingAPI(page);

  // Mock other common endpoints
  await page.route('**/api/shops/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Wait for specific API call and return the request data
 */
export async function waitForAPICall(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  return page.waitForRequest(
    (request) => {
      const url = request.url();
      const matchesUrl = typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);

      return matchesUrl && request.method() === method;
    },
    { timeout: 5000 }
  );
}

/**
 * Intercept and capture API request payload
 */
export async function captureAPIRequest(
  page: Page,
  urlPattern: string | RegExp
): Promise<any> {
  let capturedData: any = null;

  await page.route(urlPattern, async (route) => {
    capturedData = route.request().postDataJSON();
    await route.continue();
  });

  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (capturedData) {
        clearInterval(checkInterval);
        resolve(capturedData);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(null);
    }, 10000);
  });
}

/**
 * Mock slow API response for testing loading states
 */
export async function mockSlowOnboardingAPI(page: Page, delayMs: number = 2000) {
  await page.route('**/api/onboarding/complete', async (route) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        shopId: 1,
        slug: 'test-shop',
      }),
    });
  });
}

/**
 * Clear all API route mocks
 */
export async function clearAPIMocks(page: Page) {
  await page.unroute('**/*');
}
