import { test, expect } from "@playwright/test";

const TEST_SECRET = "super_secret_test_key_123";
const API_URL = "http://localhost:8000";
const APP_URL = "http://localhost:3000";

test.describe("Authentication Flow", () => {
  let testUserId: string;
  let testEmail: string;

  test.beforeEach(() => {
    const timestamp = Date.now();
    testUserId = `test_${timestamp}`;
    testEmail = `ui-test-${timestamp}@example.com`;
  });

  test.afterEach(async () => {
    await fetch(`${API_URL}/test01/test_cleanup`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: testUserId, secret: TEST_SECRET }),
    }).catch(() => {});
  });

  test("User can sign up and reach dashboard", async ({ page }) => {
    await page.goto(`${APP_URL}/register`);

    await page.fill('input[type="text"]', testUserId);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', "SecurePass123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${APP_URL}/dashboard`);
  });

  test("User sees error message with invalid credentials", async ({ page }) => {
    await page.goto(`${APP_URL}/login`);

    await page.fill('input[type="text"]', "asdphs34");
    await page.fill('input[type="password"]', "WrongPass!");
    await page.click('button[type="submit"]');

    const errorMsg = page.locator(".error-toast");
    await expect(errorMsg).toBeVisible();
  });
});
