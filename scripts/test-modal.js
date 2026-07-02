const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const email = `test${Date.now()}@example.com`;

  console.log('Navigating to register...');
  await page.goto('http://localhost:3000/register');
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);
  if (page.url().includes('login')) {
    console.log('Navigating to login...');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }

  if (page.url().includes('onboarding')) {
    console.log('Onboarding step...');
    // Click the label for USD (by evaluating click on the radio input wrapper)
    await page.evaluate(() => {
      document.querySelector('input[value="USD"]').click();
    });
    await page.click('button:has-text("Start Tracking")');
    await page.waitForTimeout(2000);
  }

  console.log('At dashboard');
  // Wait for the BottomNav to appear
  await page.waitForSelector('nav');
  
  // Wait a bit for animations
  await page.waitForTimeout(1000);

  // Click the Add button (it has the "add" icon inside BottomNav)
  console.log('Clicking add transaction button...');
  await page.click('nav button:has(span:text("add"))');

  await page.waitForSelector('textarea[placeholder="What did you spend today?"]');
  await page.waitForTimeout(1000); // Wait for modal slide up animation
  console.log('Modal opened, taking screenshot...');
  await page.screenshot({ path: path.join(screenshotsDir, 'add_expense_modal.png') });

  console.log('Typing transaction...');
  await page.fill('textarea[placeholder="What did you spend today?"]', 'Lunch $15');

  console.log('Saving...');
  await page.click('button:has(span:text("Save"))');
  
  console.log('Waiting for success screen...');
  await page.waitForSelector('h1:has-text("Expense Added")');
  await page.waitForTimeout(1000); // Wait for success fade in animation
  
  console.log('Expense added, taking screenshot...');
  await page.screenshot({ path: path.join(screenshotsDir, 'expense_confirmed.png') });

  await browser.close();
  console.log('Done!');
})();
