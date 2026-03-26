import { test, expect } from "@playwright/test";

test.describe("Cards page & filters", () => {
  test("cards page loads and shows cards", async ({ page }) => {
    await page.goto("/en/cards");
    await expect(page.getByText("Islamic Greeting Cards")).toBeVisible();
    // Should show at least one card
    const cards = page.locator("a[href*='/customize/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows all 15 cards with no filter", async ({ page }) => {
    await page.goto("/en/cards");
    const cards = page.locator("a[href*='/customize/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBe(15);
  });

  test("Eid filter shows only Eid cards", async ({ page }) => {
    await page.goto("/en/cards?occasion=eid");
    const cards = page.locator("a[href*='/customize/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    // 3 eid-ul-fitr + 2 eid-ul-adha = 5
    expect(count).toBe(5);
  });

  test("Jummah filter shows only Jummah cards (not all cards)", async ({ page }) => {
    await page.goto("/en/cards?occasion=jummah");
    const cards = page.locator("a[href*='/customize/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    // Should show only 2 Jummah cards, NOT all 15
    expect(count).toBe(2);
    expect(count).not.toBe(15);
  });

  test("Nikah filter shows only Nikah cards", async ({ page }) => {
    await page.goto("/en/cards?occasion=nikah");
    const cards = page.locator("a[href*='/customize/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBe(2);
  });

  test("Hajj filter shows only Hajj cards", async ({ page }) => {
    await page.goto("/en/cards?occasion=hajj");
    const cards = page.locator("a[href*='/customize/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBe(1);
  });

  test("Ramadan filter shows only Ramadan cards", async ({ page }) => {
    await page.goto("/en/cards?occasion=ramadan");
    const cards = page.locator("a[href*='/customize/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    // 3 ramadan + 0 laylatul-qadr = 3
    expect(count).toBe(3);
  });

  test("home page occasion links go to correct filtered views", async ({ page }) => {
    await page.goto("/en");
    // Click Jummah occasion card on home page
    await page.click("a[href*='occasion=jummah']");
    await expect(page).toHaveURL(/occasion=jummah/);
    const cards = page.locator("a[href*='/customize/']");
    const count = await cards.count();
    expect(count).toBe(2);
  });

  test("clicking a card goes to customize page", async ({ page }) => {
    await page.goto("/en/cards");
    const firstCard = page.locator("a[href*='/customize/']").first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/customize\//);
  });
});
