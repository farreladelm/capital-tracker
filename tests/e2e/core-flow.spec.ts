import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Core User Flow', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Create a page once to share state across tests
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test('should display the initial dashboard state', async () => {
    await page.goto('/');
    await page.waitForURL('**/');
    await expect(page.locator('text=Balance').first()).toBeVisible();
    await expect(page.locator('text=$0').first()).toBeVisible();
  });

  test('should navigate to categories page when clicking categories card', async () => {
    await page.goto('/');
    await page.waitForURL('**/');
    await page.locator('a[href="/categories"]').first().click();
    await page.waitForURL('**/categories');
    await expect(page.locator('h1:has-text("Categories")').first()).toBeVisible();
    
    // Navigate back to home to keep the shared page state consistent for subsequent tests
    await page.goto('/');
    await page.waitForURL('**/');
  });

  test('should add a transaction via Add Transaction Modal', async () => {
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
    await expect(page.locator('text=$4').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=-$4').first()).toBeVisible({ timeout: 15000 });
  });

  test('should edit the transaction', async () => {
    console.log('Opening edit transaction modal...');
    await page.locator('text=coffee').first().click();
    await expect(page.locator('text=Edit Transaction')).toBeVisible();

    console.log('Changing amount to $6.00...');
    await page.fill('input[name="amount"]', '6.00');
    await page.click('button[type="submit"]:has-text("Save Changes")');

    // Wait for modal to close and dashboard total spent to update to $6, and card to -$6
    await expect(page.locator('text=$6').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=-$6').first()).toBeVisible({ timeout: 15000 });
  });

  test('should delete the transaction', async () => {
    console.log('Opening edit modal again to delete...');
    await page.locator('text=coffee').first().click();
    await page.click('button:has-text("Delete Transaction")');

    // Click confirm
    console.log('Confirming deletion...');
    await page.click('button:has-text("Confirm Delete")');

    // Verify transaction is gone and total spent returns to $0
    await expect(page.locator('text=coffee')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=$0').first()).toBeVisible({ timeout: 15000 });
  });
});

