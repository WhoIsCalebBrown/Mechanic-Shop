import { test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Authentication Setup for Playwright Tests
 * This runs once before all tests to create an authenticated session
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '../.auth/user.json');

// Test user credentials - change these to match your test environment
const TEST_USER = {
  email: 'playwright-test@mechanicshop.com',
  password: 'TestPassword123!',
  firstName: 'Playwright',
  lastName: 'Test',
};

setup('authenticate', async ({ page }) => {
  console.log('🔐 Setting up authentication...');

  // Try to login first
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for either dashboard or error
  await page.waitForTimeout(2000);

  const currentUrl = page.url();

  // If we're on dashboard, login succeeded
  if (currentUrl.includes('dashboard') || currentUrl.includes('home')) {
    console.log('✅ Login successful - test user already exists');

    // Save authentication state
    await page.context().storageState({ path: authFile });
    return;
  }

  // If login failed, user doesn't exist - create account
  console.log('📝 Test user not found, creating account...');

  await page.goto('/register');
  await page.waitForLoadState('networkidle');

  // Check if already logged in and redirected away from register
  let registerUrl = page.url();
  if (registerUrl.includes('onboarding') || registerUrl.includes('dashboard')) {
    console.log('✅ Already logged in from previous attempt');
    await page.context().storageState({ path: authFile });
    console.log('💾 Authentication state saved');
    return;
  }

  // Fill registration form using ACTUAL IDs from RegisterPage.tsx
  await page.locator('#businessName').fill('Playwright Test Shop');
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('#confirmPassword').fill(TEST_USER.password);

  // Submit registration
  const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
  await submitButton.click();

  // Wait for registration to complete and redirect
  await page.waitForTimeout(3000);

  // After registration, user should be logged in automatically
  const afterRegisterUrl = page.url();
  console.log('📍 After registration, URL is:', afterRegisterUrl);

  if (afterRegisterUrl.includes('onboarding') || afterRegisterUrl.includes('dashboard')) {
    console.log('✅ Registration successful - auto-logged in');
    await page.context().storageState({ path: authFile });
    console.log('💾 Authentication state saved');
  } else if (afterRegisterUrl.includes('login')) {
    // Redirect to login - need to login manually
    console.log('🔄 Redirected to login, logging in...');

    await page.locator('#email').fill(TEST_USER.email);
    await page.locator('#password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForTimeout(2000);
    await page.context().storageState({ path: authFile });
    console.log('✅ Login successful and state saved');
  } else if (afterRegisterUrl.includes('register')) {
    // Still on register page - check for errors
    const errorBanner = page.locator('.error-banner, [role="alert"]');
    if (await errorBanner.count() > 0) {
      const errorText = await errorBanner.first().textContent();
      console.error('❌ Registration failed with error:', errorText);

      // User might already exist, try logging in
      console.log('🔄 Attempting to login instead...');
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.locator('#email').fill(TEST_USER.email);
      await page.locator('#password').fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      await page.waitForTimeout(2000);
      await page.context().storageState({ path: authFile });
      console.log('✅ Login successful and state saved');
    }
  } else {
    console.log('⚠️  Unexpected redirect to:', afterRegisterUrl);
    // Save state anyway
    await page.context().storageState({ path: authFile });
  }
});
