/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from "@playwright/test";

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("admin@inoxcraft.com");
    await page.getByLabel("Password").fill("Admin@123456");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await use(page);
  },
});

export { expect } from "@playwright/test";
