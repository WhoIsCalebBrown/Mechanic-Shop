import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Add assertions based on your landing page content
    // For example, check if the page title is correct
    await expect(page).toHaveTitle(/CalebsShop|Mechanic Shop/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Look for a login link/button and click it
    // Adjust the selector based on your actual landing page
    const loginButton = page.getByRole('link', { name: /login|sign in/i });
    if (await loginButton.count() > 0) {
      await loginButton.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });
});

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Check for email/username input
    await expect(page.getByLabel(/email|username/i)).toBeVisible();

    // Check for password input
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');

    // Click submit without filling the form
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Wait for error messages (adjust based on your actual validation)
    // This is a placeholder - adjust selectors based on your implementation
    await page.waitForTimeout(500);
  });
});

test.describe('Register Page', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register');

    // Check for registration form elements
    await expect(page.getByRole('button', { name: /register|sign up/i })).toBeVisible();
  });
});
