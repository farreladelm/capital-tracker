import { test, expect } from "@playwright/test";

test("serves the service worker without an authentication redirect", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  const response = await page.goto("/sw.js");

  expect(response).not.toBeNull();
  expect(response?.status()).toBe(200);
  expect(page.url()).toMatch(/\/sw\.js$/);
  expect(response?.headers()["content-type"]).toContain("javascript");

  await context.close();
});
