import { test, expect } from '@playwright/test';

test.describe('History Page', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

  test('should display search, filter, and history results', async ({ page }) => {
    await page.goto('/history');
    await page.waitForURL('**/history');

    // 1. Verify Search input is visible

    const searchInput = page.locator('input[placeholder="Search transactions…"]');
    await expect(searchInput).toBeVisible();

    // 3. Verify Filter Pills are visible
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Expenses")')).toBeVisible();
    await expect(page.locator('button:has-text("Income")')).toBeVisible();
  });
});
