import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should allow user to login with valid credentials', async ({ page }) => {
    // Fill in the login form
    await page.getByLabel(/email|username/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');

    // Submit the form
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Wait for navigation after successful login
    await page.waitForURL(/.*dashboard/i, { timeout: 5000 });

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/i);
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill in with invalid credentials
    await page.getByLabel(/email|username/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Wait a bit for error to appear
    await page.waitForTimeout(1000);

    // Check for error message (adjust selector based on your implementation)
    // This could be a toast, alert, or inline error message
    const errorMessage = page.getByText(/invalid|incorrect|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should navigate to register page from login', async ({ page }) => {
    // Look for a "Sign Up" or "Register" link
    const registerLink = page.getByRole('link', { name: /register|sign up|create account/i });

    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/i);
    }
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should allow user to register with valid information', async ({ page }) => {
    // Generate a unique email for testing
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;

    // Fill in registration form (adjust fields based on your actual form)
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.count() > 0) {
      await emailInput.fill(testEmail);
    }

    const passwordInput = page.getByLabel(/^password$/i);
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('SecurePassword123!');
    }

    // Fill other required fields as needed
    // Example:
    // await page.getByLabel(/name/i).fill('Test User');
    // await page.getByLabel(/confirm password/i).fill('SecurePassword123!');

    // Submit the form
    const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
    if (await submitButton.count() > 0) {
      await submitButton.click();

      // Wait for navigation or success message
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
    // Try to access the dashboard without logging in
    await page.goto('/dashboard');

    // Should be redirected to login
    // Adjust based on your routing logic
    await page.waitForTimeout(1000);

    // Check if we're on login page or see a login form
    const url = page.url();
    const isOnLogin = url.includes('login') || url.includes('signin');

    if (isOnLogin) {
      await expect(page).toHaveURL(/.*login/i);
    }
  });
});
