import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

  test('should display settings, allow name updates, and handle navigation/logout', async ({ page }) => {
    // 1. Navigate to the profile page
    await page.goto('/account');
    await page.waitForURL('**/account');

    // 2. Check title & subtitle
    await expect(page.locator('h1', { hasText: 'Profile' })).toBeVisible();
    await expect(page.locator('p', { hasText: 'Manage your identity and settings' })).toBeVisible();

    // 3. Verify registered email and base currency are visible
    await expect(page.locator('span', { hasText: 'Registered Email' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Base Currency' })).toBeVisible();

    // 4. Update display name
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await nameInput.fill('Jane Doe');

    // Click Save Changes
    const saveButton = page.locator('button[type="submit"]', { hasText: 'Save Changes' });
    await saveButton.click();

    // 5. Verify the success toast message from sonner
    await expect(page.locator('text=Changes saved successfully!')).toBeVisible({ timeout: 15000 });

    // 6. Verify categories page link works
    const categoriesLink = page.locator('a', { hasText: 'Manage Categories' });
    await expect(categoriesLink).toBeVisible();
    await categoriesLink.click();
    await page.waitForURL('**/categories');

    // Go back to profile page
    await page.goto('/account');
    await page.waitForURL('**/account');

    // 7. Verify sign out functionality
    const signOutButton = page.locator('button', { hasText: 'Sign Out' });
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();
    
    // Verify redirect to login page
    await page.waitForURL('**/login');
    await expect(page.locator('h1', { hasText: 'Welcome back' })).toBeVisible();
  });
});
