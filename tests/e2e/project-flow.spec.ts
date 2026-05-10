import { test, expect } from "../fixtures/auth.fixture";

test.describe("Project creation and quotation flow", () => {
  test("creates a project and generates a quotation end to end", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/projects/new");
    await expect(page.getByText(/new project/i)).toBeVisible();

    // Step 1: Select or Create customer
    await page.waitForTimeout(2000); // Wait for hydration
    const newCustName = `E2E Customer ${Date.now()}`;
    await page.getByPlaceholder(/full name \*/i).fill(newCustName);
    await page.getByRole("button", { name: /create & select/i }).click({ force: true });
    // Wait for ANY selected text to appear
    await expect(page.getByText(/selected:/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /next/i }).click();

    // Step 2: Project details
    await page.getByLabel(/project type/i).fill("Sliding Security Gate");
    await page.getByLabel(/length/i).fill("3000");
    await page.getByLabel(/width/i).fill("50");
    await page.getByLabel(/height/i).fill("1800");
    // Complexity Select
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /standard/i }).click();
    await page.getByRole("button", { name: /next/i }).click();

    // Step 3: Materials
    await page.getByRole("button", { name: /add row/i }).click();
    // Material Select (the one in the row)
    await page.getByRole("combobox").last().click();
    await page.getByRole("option", { name: /stainless steel sheet 2mm/i }).click();
    await page.getByLabel(/qty/i).fill("15");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 4: Costs
    await page.getByLabel(/labour cost/i).fill("50000");
    await page.getByLabel(/transport cost/i).fill("10000");
    await expect(page.getByTestId("total-cost-preview")).toBeVisible();
    await page.getByRole("button", { name: /next/i }).click();

    // Step 5: Review and submit
    await expect(page.getByText(/review/i)).toBeVisible();
    await expect(page.getByText("Sliding Security Gate")).toBeVisible();
    await page.getByRole("button", { name: /create project/i }).click();

    await page.waitForURL(/\/projects\/[a-z0-9-]+/, { timeout: 15000 });
    await expect(page.getByText("Sliding Security Gate")).toBeVisible();

    // Generate quotation
    await page.getByRole("button", { name: /generate quotation/i }).click();
    // Reference pattern: INX-YYYY-NNNN
    await expect(page.getByText(/INX-\d{4}-\d{4}/)).toBeVisible({ timeout: 15000 });
  });

  test("admin can view and manage materials catalogue", async ({ authenticatedPage: page }) => {
    await page.goto("/admin/materials");
    await expect(page.getByRole("heading", { name: /materials catalogue/i })).toBeVisible();

    // Add a new material
    await page.getByRole("button", { name: /add material/i }).click();
    await page.getByLabel(/name/i).fill("Test Material Playwright");
    await page.getByRole("combobox").first().click();
    // Use kilogram (lowercase) as it appears in the select content logic
    await page.getByRole("option", { name: /kilogram/i }).click();
    await page.getByLabel(/price/i).fill("75000");
    await page.getByRole("button", { name: /save material/i }).click();

    await expect(page.getByText("Test Material Playwright")).toBeVisible({ timeout: 10000 });
  });
});
