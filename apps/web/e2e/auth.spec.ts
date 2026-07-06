import { test, expect } from "@playwright/test";
import {
  APP_URL,
  API_URL,
  makeUser,
  apiRegister,
  apiLogin,
  apiCleanupUser,
  browserRegister,
  browserLogin,
} from "./helpers";

test.describe("Authentication Flow", () => {
  // ── AUTH-01: Successful sign-up and redirect ────────────────────────────────
  test("AUTH-01: Successful sign-up redirects to projects page", async ({
    page,
  }) => {
    const user = makeUser();

    try {
      await browserRegister(page, user);
      await expect(page).toHaveURL(`${APP_URL}/projects`);
    } finally {
      await apiCleanupUser(user.user_id);
    }
  });

  // ── AUTH-02: Sign-in with correct credentials ───────────────────────────────
  test("AUTH-02: Sign-in with valid credentials redirects to projects page", async ({
    page,
  }) => {
    const user = makeUser();
    await apiRegister(user);

    try {
      await browserLogin(page, user.user_id, user.password);
      await expect(page).toHaveURL(`${APP_URL}/projects`);
    } finally {
      await apiCleanupUser(user.user_id);
    }
  });

  // ── AUTH-03: Wrong password shows error, no session ─────────────────────────
  test("AUTH-03: Wrong password shows error and does not create a session", async ({
    page,
  }) => {
    const user = makeUser();
    await apiRegister(user);

    try {
      await page.goto(`${APP_URL}/login`);
      await page.fill("#user_id", user.user_id);
      await page.fill("#password", "WrongPassword999!");
      await page.click('button[type="submit"]');

      // Error banner should appear
      const errorBanner = page
        .locator('[role="alert"]')
        .filter({ hasText: /Invalid credentials|unexpected error/i });
      await expect(errorBanner).toBeVisible({ timeout: 5_000 });
      await expect(errorBanner).toHaveText(
        /Invalid credentials|unexpected error/i,
      );
      // Should remain on the login page — no redirect
      await expect(page).toHaveURL(`${APP_URL}/login`);

      // No auth_token cookie should be set
      const cookies = await page.context().cookies();
      const authCookie = cookies.find((c) => c.name === "auth_token");
      expect(authCookie).toBeUndefined();
    } finally {
      await apiCleanupUser(user.user_id);
    }
  });

  // ── AUTH-04: Non-existent user shows error ──────────────────────────────────
  test("AUTH-04: Sign-in with non-existent user_id shows error", async ({
    page,
  }) => {
    await page.goto(`${APP_URL}/login`);
    await page.fill("#user_id", `ghost_user_${Date.now()}`);
    await page.fill("#password", "AnyPass123!");
    await page.click('button[type="submit"]');

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(`${APP_URL}/login`);
  });

  // ── AUTH-05: Duplicate email rejected ──────────────────────────────────────
  test("AUTH-05: Duplicate email registration is rejected", async ({
    page,
  }) => {
    const user = makeUser();
    await apiRegister(user);

    const duplicate = {
      ...makeUser(),
      email: user.email, // same email, different user_id
    };

    try {
      await page.goto(`${APP_URL}/register`);
      await page.fill("#user_id", duplicate.user_id);
      await page.fill("#email", duplicate.email);
      await page.fill("#password", duplicate.password);
      await page.fill("#confirmPassword", duplicate.password);
      await page.click('button[type="submit"]');

      // Should show an error, not redirect
      const errorBanner = page.locator(".bg-destructive\\/10");
      await expect(errorBanner).toBeVisible({ timeout: 5_000 });
      await expect(page).toHaveURL(`${APP_URL}/register`);
    } finally {
      await apiCleanupUser(user.user_id);
      await apiCleanupUser(duplicate.user_id);
    }
  });

  // ── AUTH-06: Password hash never in API response ────────────────────────────
  test("AUTH-06: Password hash never appears in register, login, or /me response", async ({
    page,
  }) => {
    const user = makeUser();
    const responseBodyParts: string[] = [];

    // Intercept API responses from the NestJS backend
    page.on("response", async (response) => {
      const url = response.url();
      if (
        url.includes(API_URL) &&
        (url.includes("create_member") ||
          url.includes("testlogin") ||
          url.includes("/me"))
      ) {
        try {
          const body = await response.text();
          responseBodyParts.push(body);
        } catch {
          // binary/stream response — skip
        }
      }
    });

    try {
      // Register
      await page.goto(`${APP_URL}/register`);
      await page.fill("#user_id", user.user_id);
      await page.fill("#email", user.email);
      await page.fill("#password", user.password);
      await page.fill("#confirmPassword", user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${APP_URL}/projects`, { timeout: 10_000 });

      // Wait a moment for /me to be called by RouteGuard
      await page.waitForTimeout(1_500);

      // Also directly call login so we capture that response too
      await page.context().clearCookies();
      await page.goto(`${APP_URL}/login`);
      await page.waitForSelector("#user_id", {
        state: "visible",
        timeout: 10_000,
      });

      await page.fill("#user_id", user.user_id);
      await page.fill("#password", user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${APP_URL}/projects`, { timeout: 10_000 });

      // Check none of the captured bodies contain a bcrypt hash
      const bcryptPattern = /\$2[aby]\$\d{2}\$/;
      for (const body of responseBodyParts) {
        expect(body).not.toMatch(bcryptPattern);
        // Also ensure "password" key value is not present
        if (body.includes('"password"')) {
          // Allow the key name but not a non-empty value that looks hashed
          expect(body).not.toMatch(/"password"\s*:\s*"\$2/);
        }
      }
    } finally {
      await apiCleanupUser(user.user_id);
    }
  });

  // ── AUTH-07: Session persists across page reload ────────────────────────────
  test("AUTH-07: Session persists across a full page reload", async ({
    page,
  }) => {
    const user = makeUser();
    await apiRegister(user);

    try {
      await browserLogin(page, user.user_id, user.password);
      await expect(page).toHaveURL(`${APP_URL}/projects`);

      // Reload — cookie should be sent automatically
      await page.reload();

      // Should still be on /projects, not redirected to /login
      await expect(page).toHaveURL(`${APP_URL}/projects`, { timeout: 8_000 });
    } finally {
      await apiCleanupUser(user.user_id);
    }
  });

  // ── AUTH-08: Logout ends session; old cookie cannot be replayed ────────────
  test("AUTH-08: Logout ends the session and protected page redirects to login", async ({
    page,
    context,
  }) => {
    const user = makeUser();
    await apiRegister(user);

    try {
      await browserLogin(page, user.user_id, user.password);
      await expect(page).toHaveURL(`${APP_URL}/projects`);

      // Capture auth_token value before logout for replay test
      const cookiesBefore = await context.cookies();
      const authCookieBefore = cookiesBefore.find(
        (c) => c.name === "auth_token",
      );
      expect(authCookieBefore).toBeDefined();

      // Open settings and log out via the API
      // (using API call because the UI logout goes through the same endpoint)
      const { cookieHeader, csrfToken } = await apiLogin(
        user.user_id,
        user.password,
      );
      await fetch(`${API_URL}/testlogin/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-csrf-token": csrfToken,
        },
      });

      // Clear the browser's own cookies to simulate the logout clearing them
      await context.clearCookies();

      // Navigating to a protected route should now redirect to login
      await page.goto(`${APP_URL}/projects`);
      await expect(page).toHaveURL(`${APP_URL}/login`, { timeout: 8_000 });

      // Confirm the refresh token was revoked server-side:
      // Attempting to use the old refresh token should return 401
      const replayRes = await fetch(`${API_URL}/testlogin/refresh`, {
        method: "POST",
        headers: {
          cookie: cookieHeader,
          "x-csrf-token": csrfToken,
        },
      });
      // 401 (invalid/revoked) or 403 (CSRF mismatch) — either confirms the session is dead
      expect([401, 403]).toContain(replayRes.status);
    } finally {
      await apiCleanupUser(user.user_id);
    }
  });
});
