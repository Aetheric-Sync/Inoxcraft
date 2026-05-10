import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders all elements", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/INOXCRAFT/);
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error toast on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("wrong@email.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid|error/i)).toBeVisible({ timeout: 5000 });
  });

  test("admin can log in and reach dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("admin@inoxcraft.com");
    await page.getByLabel("Password").fill("Admin@123456");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("sign out clears session and redirects to login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("admin@inoxcraft.com");
    await page.getByLabel("Password").fill("Admin@123456");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");
    // Open user menu (click the avatar/name area)
    await page.locator('button:has-text("Hakeem Admin")').click();
    await page.getByRole("menuitem", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
