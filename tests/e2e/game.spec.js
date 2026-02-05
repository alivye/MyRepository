import { test, expect } from "@playwright/test";

test("page loads and shows the score HUD", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.getByText("Счет:")).toBeVisible();
  await expect(page.locator("#game")).toBeVisible();
});
