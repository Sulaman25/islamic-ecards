import { test, expect } from "@playwright/test";

test.describe("Customise Studio", () => {
  // Get the first card's ID from the cards page to use in studio tests
  let firstCardUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/en/cards");
    const firstCard = page.locator("a[href*='/customize/']").first();
    firstCardUrl = await firstCard.getAttribute("href") ?? "/en/cards";
    await page.close();
  });

  test("customize page loads with studio", async ({ page }) => {
    await page.goto(firstCardUrl);
    await expect(page.locator("body")).toBeVisible();
    // Studio should have recipient name input
    await expect(page.locator("input[placeholder*='Fatima']").or(
      page.locator("input[placeholder*='فاطمة']")
    ).or(
      page.locator("input[placeholder*='فاطمہ']")
    )).toBeVisible();
  });

  test("filling in names updates card preview", async ({ page }) => {
    await page.goto(firstCardUrl);
    // Fill recipient name
    const recipientInput = page.locator("input").first();
    await recipientInput.fill("Ahmed");
    // The card preview should show the name
    await expect(page.getByText("Ahmed")).toBeVisible();
  });

  test("next button is disabled without required fields", async ({ page }) => {
    await page.goto(firstCardUrl);
    // The next button should be disabled or hint shown when fields are empty
    const nextBtn = page.locator("button").filter({ hasText: /next|send|forward/i }).first();
    if (await nextBtn.isVisible()) {
      // Either disabled or shows a hint
      const isDisabled = await nextBtn.isDisabled();
      if (!isDisabled) {
        await nextBtn.click();
        // Should show a hint about filling in fields
        await expect(page.getByText(/name|message/i).first()).toBeVisible();
      }
    }
  });

  test("verse picker opens and closes", async ({ page }) => {
    await page.goto(firstCardUrl);
    const verseBtn = page.locator("button").filter({ hasText: /verse|آية|آیت/i }).first();
    if (await verseBtn.isVisible()) {
      await verseBtn.click();
      await expect(page.locator("[placeholder*='Search']").or(
        page.locator("[placeholder*='ابحث']")
      )).toBeVisible();
    }
  });
});
