import { Page } from '@playwright/test';

/**
 * Test user credentials
 */
export const TEST_USER = {
  email: 'test@mechanicshop.com',
  password: 'TestPassword123!',
  shopOwner: {
    email: 'owner@mechanicshop.com',
    password: 'OwnerPassword123!',
  },
};

/**
 * Helper function to login a user
 */
export async function login(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  await page.goto('/login');
  await page.getByLabel(/email|username/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  // Wait for navigation or dashboard to load
  try {
    await page.waitForURL(/.*(?:dashboard|home)/i, { timeout: 5000 });
  } catch {
    // If redirect doesn't happen, wait a moment and continue
    await page.waitForTimeout(1000);
  }
}

/**
 * Helper function to register and login a new user
 */
export async function registerNewUser(page: Page, userData?: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  const timestamp = Date.now();
  const defaultData = {
    email: `test${timestamp}@mechanicshop.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };

  const data = { ...defaultData, ...userData };

  await page.goto('/register');

  // Fill registration form (adjust fields based on your form)
  const emailInput = page.getByLabel(/email/i);
  if (await emailInput.count() > 0) {
    await emailInput.fill(data.email);
  }

  const passwordInput = page.getByLabel(/^password$/i);
  if (await passwordInput.count() > 0) {
    await passwordInput.fill(data.password);
  }

  const firstNameInput = page.getByLabel(/first name/i);
  if (await firstNameInput.count() > 0) {
    await firstNameInput.fill(data.firstName);
  }

  const lastNameInput = page.getByLabel(/last name/i);
  if (await lastNameInput.count() > 0) {
    await lastNameInput.fill(data.lastName);
  }

  // Submit registration
  const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
  await submitButton.click();

  // Wait for registration to complete
  await page.waitForTimeout(2000);

  return data;
}

/**
 * Setup authenticated session by directly setting auth token
 * This is faster than going through the login flow
 */
export async function setupAuthenticatedSession(page: Page, token?: string) {
  // Navigate to the site first
  await page.goto('/');

  // Set authentication token in localStorage
  const authToken = token || 'mock-test-token-for-e2e-tests';

  await page.evaluate((token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);
  }, authToken);

  // Reload to apply authentication
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to logout a user
 */
export async function logout(page: Page) {
  // Adjust selector based on your actual logout button/link
  const logoutButton = page.getByRole('button', { name: /logout|sign out/i });

  if (await logoutButton.count() > 0) {
    await logoutButton.click();
    await page.waitForURL(/.*login|\/$/i, { timeout: 5000 });
  }
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    const url = page.url();
    return !url.includes('login') && !url.includes('signin');
  } catch {
    return false;
  }
}

/**
 * Helper function to generate a unique email for testing
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}${timestamp}@example.com`;
}

/**
 * Helper function to wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 5000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}
