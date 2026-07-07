import { test as setup, expect } from '@playwright/test';
import { prisma } from '../../lib/prisma';

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

  // 4. Seed transactions for trends analytics page verification
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (user) {
    const category = await prisma.category.findFirst({
      where: { userId: user.id, name: "Food" }
    });

    if (category) {
      await prisma.transaction.createMany({
        data: [
          { userId: user.id, categoryId: category.id, type: "EXPENSE", amountMinor: 12000, description: "June Groceries", date: new Date("2026-06-15T12:00:00Z") },
          { userId: user.id, categoryId: category.id, type: "EXPENSE", amountMinor: 10000, description: "July Dinner", date: new Date("2026-07-05T12:00:00Z") }
        ]
      });
    }
  }

  // Save storage state to be shared across tests
  await page.context().storageState({ path: authFile });
});
