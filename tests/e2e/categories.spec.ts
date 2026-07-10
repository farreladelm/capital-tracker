import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Categories Management Flow', () => {
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

  test('should display categories page elements', async () => {
    await page.goto('/categories');
    await page.waitForURL('**/categories');

    // Verify page title block and Settings label
    await expect(page.locator('text=Settings').first()).toBeVisible();
    await expect(page.locator('h1', { hasText: 'Categories' })).toBeVisible();

    // Verify search input
    await expect(page.locator('input[placeholder="Search categories…"]')).toBeVisible();

    // Verify filter pills
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Expenses")')).toBeVisible();
    await expect(page.locator('button:has-text("Income")')).toBeVisible();

    // Verify Create Category action trigger button
    await expect(page.locator('button:has-text("Create Category")')).toBeVisible();
  });

  test('should create a custom category with a weekly budget limit', async () => {
    console.log('Opening create category modal...');
    await page.locator('button:has-text("Create Category")').click();

    // Verify modal heading
    await expect(page.locator('h2:has-text("Create Category")')).toBeVisible();

    // Fill category name
    await page.fill('input[name="name"]', 'Novels Spec');

    // Choose type "Expense" via custom select dropdown component
    // Starts with "Expense". Let's click it to open the list, select "Income" (which hides budget), 
    // and then open it again and select "Expense" (which shows budget).
    await page.locator('form button').filter({ hasText: 'Expense' }).first().click();
    await page.locator('.absolute button:has-text("Income")').click();
    await expect(page.locator('input[name="budgetAmount"]')).not.toBeVisible();

    await page.locator('form button').filter({ hasText: 'Income' }).first().click();
    await page.locator('.absolute button:has-text("Expense")').click();
    await expect(page.locator('input[name="budgetAmount"]')).toBeVisible();

    // Choose a color chip (e.g. Purple "#9B5DE5")
    await page.locator('button[style*="background-color: rgb(155, 93, 229)"]').click();

    // Choose an icon (e.g. school)
    await page.locator('button[title="School"]').click();

    // Fill budget amount
    await page.fill('input[name="budgetAmount"]', '45.50');

    // Choose weekly period from default dropdown
    await page.selectOption('select[name="budgetPeriod"]', 'WEEKLY');

    // Click submit button
    await page.click('button[type="submit"]:has-text("Create Category")');

    // Verify modal closed and category is displayed
    await page.locator('h2:has-text("Create Category")').waitFor({ state: 'hidden' });
    await expect(page.locator('text=Novels Spec')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=limit: $45.5/wk')).toBeVisible({ timeout: 15000 });
  });

  test('should search and filter the category list', async () => {
    const searchInput = page.locator('input[placeholder="Search categories…"]');
    
    // Type in search box
    await searchInput.fill('Novels');
    await expect(page.locator('text=Food')).not.toBeVisible();
    await expect(page.locator('text=Novels Spec')).toBeVisible();

    // Clear search
    await page.locator('button[aria-label="Clear search"]').click();
    await expect(page.locator('text=Food')).toBeVisible();

    // Filter by Income
    await page.locator('button:has-text("Income")').click();
    await expect(page.locator('text=Novels Spec')).not.toBeVisible();
    
    // Reset filter
    await page.locator('button:has-text("All")').click();
    await expect(page.locator('text=Novels Spec')).toBeVisible();
  });

  test('should edit the category details and budget limit', async () => {
    console.log('Opening edit category modal...');
    await page.locator('text=Novels Spec').first().click();

    await expect(page.locator('h2:has-text("Edit Category")')).toBeVisible();

    // Update name
    await page.fill('input[name="name"]', 'Literature Spec');

    // Update budget limit
    await page.fill('input[name="budgetAmount"]', '60.00');

    // Save changes
    await page.click('button[type="submit"]:has-text("Save Changes")');

    // Verify changes updated
    await page.locator('h2:has-text("Edit Category")').waitFor({ state: 'hidden' });
    await expect(page.locator('text=Literature Spec')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=limit: $60/wk')).toBeVisible({ timeout: 15000 });
  });

  test('should delete the category', async () => {
    console.log('Opening edit category modal to delete...');
    await page.locator('text=Literature Spec').first().click();

    // Click delete trigger
    await page.locator('button:has-text("Delete Category")').click();

    // Confirm deletion
    await page.locator('button:has-text("Yes, Delete")').click();

    // Verify category is deleted
    await page.locator('h2:has-text("Edit Category")').waitFor({ state: 'hidden' });
    await expect(page.locator('text=Literature Spec')).not.toBeVisible({ timeout: 15000 });
  });
});
