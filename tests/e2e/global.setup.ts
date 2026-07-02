import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  setup.setTimeout(60000); // 60s is plenty for registration + onboarding

  const testEmail = `testuser-${Date.now()}@example.com`;
  const testPassword = 'password123';

  // 1. Register
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button[type="submit"]');

  // 2. Onboarding (should be redirected here)
  await page.waitForURL('**/onboarding');
  await expect(page.locator('text=Start Tracking')).toBeVisible();
  
  // Select USD radio button and submit
  await page.locator('input[value="USD"]').click({ force: true });
  await page.click('button:has-text("Start Tracking")');

  // 3. Dashboard (Wait for redirect to confirm onboarding completed)
  await page.waitForURL('**/');
  await expect(page.locator('text=Balance').first()).toBeVisible();

  // Save storage state to be shared across tests
  await page.context().storageState({ path: authFile });
});
