const { chromium } = require('@playwright/test');

(async () => {
  const url = process.argv[2] || 'http://localhost:3000/';
  const outPath = process.argv[3] || 'screenshot.png';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.screenshot({ path: outPath });
  await browser.close();
})();
