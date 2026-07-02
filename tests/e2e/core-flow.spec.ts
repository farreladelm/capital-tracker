import { test, expect } from '@playwright/test';

test.describe('Core User Flow', () => {
  const testEmail = `testuser-${Date.now()}@example.com`;
  const testPassword = 'password123';

  test('User can register, onboard, add transaction, edit transaction, and delete transaction', async ({ page }) => {
    test.setTimeout(150000);
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

    // 3. Dashboard
    await page.waitForURL('**/');
    await expect(page.locator('text=Balance').first()).toBeVisible();

    // The spent total should be visible ($0 at first)
    await expect(page.locator('text=$0').first()).toBeVisible();

    // 4. Log a transaction via Add Transaction Modal
    console.log('Opening add transaction modal...');
    await page.locator('nav button').filter({ hasText: 'add' }).click();

    // Wait for the modal textarea
    await page.waitForSelector('textarea[placeholder="What did you spend today?"]');
    await page.fill('textarea[placeholder="What did you spend today?"]', 'coffee 4');

    // Save
    console.log('Saving transaction...');
    await page.click('button:has-text("Save")');

    // Wait for success screen
    await page.waitForSelector('h1:has-text("Expense Added")');
    
    // Click Done to return to dashboard
    await page.click('button:has-text("Done")');

    // Wait for dashboard spent total to update to $4, and card to -$4
    await expect(page.locator('text=$4').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=-$4').first()).toBeVisible({ timeout: 10000 });

    // 5. Edit transaction
    console.log('Opening edit transaction modal...');
    await page.locator('text=coffee').first().click();
    await expect(page.locator('text=Edit Transaction')).toBeVisible();

    console.log('Changing amount to $6.00...');
    await page.fill('input[name="amount"]', '6.00');
    await page.click('button[type="submit"]:has-text("Save Changes")');

    // Wait for modal to close and dashboard total spent to update to $6, and card to -$6
    await expect(page.locator('text=$6').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=-$6').first()).toBeVisible({ timeout: 10000 });

    // 6. Delete transaction
    console.log('Opening edit modal again to delete...');
    await page.locator('text=coffee').first().click();
    await page.click('button:has-text("Delete Transaction")');

    // Click confirm
    console.log('Confirming deletion...');
    await page.click('button:has-text("Confirm Delete")');

    // Verify transaction is gone and total spent returns to $0
    await expect(page.locator('text=coffee')).not.toBeVisible();
    await expect(page.locator('text=$0').first()).toBeVisible();
  });
});
