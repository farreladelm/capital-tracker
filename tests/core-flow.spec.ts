import { test, expect } from '@playwright/test';

test.describe('Core User Flow', () => {
  const testEmail = `testuser-${Date.now()}@example.com`;
  const testPassword = 'password123';

  test('User can register, onboard, and see error on missing AI key', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 2. Onboarding (should be redirected here)
    await page.waitForURL('**/onboarding');
    await expect(page.locator('text=Start Tracking')).toBeVisible();
    
    // Select USD by clicking the label text
    await page.locator('text=USD').click();
    await page.click('button[type="submit"]');

    // 3. Dashboard
    await page.waitForURL('**/');
    await expect(page.locator('text=Capital Tracker')).toBeVisible();

    // The net total should be visible (0 at first)
    await expect(page.locator('text=$0')).toBeVisible();

    // 4. Log a transaction via Magic Box
    await page.fill('input[placeholder="e.g. bought coffee for 4$"]', 'coffee 4');
    await page.click('button[type="submit"]');

    // Wait for the net total to update to -$4 after successful parse
    await expect(page.locator('text=-$4').first()).toBeVisible({ timeout: 10000 });
  });
});
