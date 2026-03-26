import { test, expect } from "@playwright/test";

test.describe("Navigation & locale routing", () => {
  test("redirects / to /en", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en/);
  });

  test("home page loads with navbar and hero", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Islamic Ecards", exact: true })).toBeVisible();
    await expect(page.getByText("Browse Cards").first()).toBeVisible();
  });

  test("Arabic locale loads with RTL direction", async ({ page }) => {
    await page.goto("/ar");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
  });

  test("Urdu locale loads with RTL direction", async ({ page }) => {
    await page.goto("/ur");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ur");
  });

  test("locale switcher changes language", async ({ page }) => {
    await page.goto("/en");
    // Select Arabic from the locale dropdown
    await page.selectOption("select", "ar");
    await expect(page).toHaveURL(/\/ar/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.getByText(/price|plan/i).first()).toBeVisible();
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/en/sign-in");
    await expect(page.locator("body")).toBeVisible();
  });
});
