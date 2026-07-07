import { test, expect } from '@playwright/test';

test.describe('Trends Page', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

  test('should display analytics charts, comparison card, and budget progress', async ({ page }) => {
    await page.goto('/trends');
    await page.waitForURL('**/trends');

    // 1. Verify page heading is Analytics
    await expect(page.locator('h1', { hasText: 'Analytics' })).toBeVisible();

    // 2. Verify AI Insight header is visible
    await expect(page.locator('span', { hasText: 'AI Insight' })).toBeVisible();

    // 3. Verify standard charts headings are visible
    await expect(page.locator('h2', { hasText: 'Spending Trend' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Categories' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Comparison' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Budgets' })).toBeVisible();

    // 4. Verify MonthSelector options are visible
    await expect(page.locator('button:has-text("July")')).toBeVisible();
    await expect(page.locator('button:has-text("June")')).toBeVisible();

    // 5. Change month to June and verify page updates
    await page.click('button:has-text("June")');
    
    // Check that June is selected/active
    const juneButton = page.locator('button:has-text("June")');
    await expect(juneButton).toHaveClass(/bg-primary/);
  });
});
