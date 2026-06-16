import { test, expect } from "@playwright/test";

const API_URL = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8000";

test.describe("Authentication", () => {
  test("user can log in with seeded account", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("alex@purrfectmatch.test");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("link", { name: "Browse" })).toBeVisible();
    await expect(page.getByText("Alex", { exact: false })).toBeVisible();
  });

  test("protected route redirects to login", async ({ page }) => {
    await page.goto("/my-listings");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Browse", () => {
  test("homepage lists cats and opens detail panel", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Find Your/ })).toBeVisible();
    await expect(page.getByText(/Showing \d+ cats/)).toBeVisible();

    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible();
    await firstCard.locator("button").first().click();

    await expect(page.getByRole("button", { name: "Contact Owner" })).toBeVisible();
  });

  test("cat detail page loads by slug", async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/cats/oliver`);
    test.skip(!response.ok(), "Seeded API unavailable");

    await page.goto("/cats/oliver");
    await expect(page.getByRole("heading", { name: "Oliver" })).toBeVisible();
  });
});

test.describe("Apply to adopt", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("alex@purrfectmatch.test");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("link", { name: "Browse" })).toBeVisible();
  });

  test("adopter can open apply modal from cat detail", async ({ page }) => {
    await page.goto("/cats/luna");
    await page.getByRole("button", { name: "Apply to Adopt" }).click();

    await expect(page.getByRole("heading", { name: /Apply to Adopt/ })).toBeVisible();
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.getByRole("heading", { name: /Apply to Adopt/ })).not.toBeVisible();
  });
});
