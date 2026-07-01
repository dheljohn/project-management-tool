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

  test("User can sign up successfully and reach projects page", async ({
    page,
  }) => {
    await page.goto(`${APP_URL}/register`);

    // Target inputs exactly by their distinct HTML id attributes
    await page.fill("#user_id", testUserId);
    await page.fill("#email", testEmail);
    await page.fill("#password", "SecurePass123!");
    await page.fill("#confirmPassword", "SecurePass123!");

    // Click the submit button which switches text upon submission
    await page.click('button[type="submit"]');

    // Verify redirect
    await expect(page).toHaveURL(`${APP_URL}/projects`);
  });

  test("User sees error alert with invalid login credentials", async ({
    page,
  }) => {
    await page.goto(`${APP_URL}/login`);

    await page.fill("#user_id", "asdphs34");
    await page.fill("#password", "WrongPass!");
    await page.click('button[type="submit"]');

    // Matches your actual error banner container classes
    const errorAlert = page.locator(".bg-destructive\\/10");

    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(
      /Invalid credentials|Network error|unexpected error/i,
    );
  });

  test("User can toggle password visibility mask", async ({ page }) => {
    await page.goto(`${APP_URL}/login`);

    const passwordInput = page.locator("#password");

    // 1. Grab the toggle button strictly by its accessible role and starting label
    const showButton = page.getByRole("button", { name: "Show" });

    // Confirm password input starts masked
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(showButton).toBeVisible();

    // 2. Click the button to reveal the password
    await showButton.click();

    // 3. Confirm input unmasks to plain text
    await expect(passwordInput).toHaveAttribute("type", "text");

    // 4. Locate the button by its new label to confirm the text toggled successfully
    const hideButton = page.getByRole("button", { name: "Hide" });
    await expect(hideButton).toBeVisible();
  });
});
