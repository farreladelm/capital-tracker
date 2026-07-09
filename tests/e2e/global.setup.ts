import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  setup.setTimeout(120000); // 120s to accommodate slow dev server cold compilation and database compaction

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

  // 4. Seed transactions for trends analytics page verification via API (avoids import.meta ESM conflicts)
  const categoriesResponse = await page.request.get('/api/categories');
  expect(categoriesResponse.ok()).toBeTruthy();
  const { categories } = await categoriesResponse.json();
  const foodCategory = categories.find((c: any) => c.name === "Food");

  if (foodCategory) {
    const createTxResponse1 = await page.request.post('/api/transactions', {
      data: {
        categoryId: foodCategory.id,
        type: "EXPENSE",
        amountMinor: 12000,
        description: "June Groceries",
        date: new Date("2026-06-15T12:00:00Z").toISOString(),
      }
    });
    expect(createTxResponse1.ok()).toBeTruthy();

    const createTxResponse2 = await page.request.post('/api/transactions', {
      data: {
        categoryId: foodCategory.id,
        type: "EXPENSE",
        amountMinor: 10000,
        description: "May Dinner",
        date: new Date("2026-05-05T12:00:00Z").toISOString(),
      }
    });
    expect(createTxResponse2.ok()).toBeTruthy();
  }

  // Save storage state to be shared across tests
  await page.context().storageState({ path: authFile });
});
