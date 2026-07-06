/**
 * Shared helpers for Proyekto E2E tests.
 *
 * All API calls go directly to the NestJS backend (no browser involved),
 * so they are fast and independent of UI availability for setup/teardown.
 */

export const API_URL = "http://localhost:8000";
export const APP_URL = "http://localhost:3000";
export const TEST_SECRET = "super_secret_test_key_123";

// ─── ID factories ────────────────────────────────────────────────────────────

export function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function makeUser(suffix = uid()) {
  return {
    user_id: `e2e_${suffix}`,
    email: `e2e_${suffix}@test.invalid`,
    password: "E2ePass123!",
  };
}

// ─── API helpers ─────────────────────────────────────────────────────────────

/** Register a new member via the API. Returns the created user object. */
export async function apiRegister(user: ReturnType<typeof makeUser>) {
  const res = await fetch(`${API_URL}/test01/create_member`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    throw new Error(`apiRegister failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/**
 * Log in via the API and return:
 *   - cookies: the raw Set-Cookie header values (auth_token, csrf_token)
 *   - csrfToken: the csrf_token value extracted and ready to use as a header
 */
export async function apiLogin(
  user_id: string,
  password: string,
): Promise<{ cookieHeader: string; csrfToken: string }> {
  const res = await fetch(`${API_URL}/testlogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, password }),
  });
  if (!res.ok) {
    throw new Error(`apiLogin failed: ${res.status} ${await res.text()}`);
  }
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const cookieHeader = setCookies
    .map((c) => c.split(";")[0])
    .join("; ");
  const csrfMatch = setCookies
    .find((c) => c.startsWith("csrf_token="))
    ?.split(";")[0]
    ?.split("=")[1];
  return { cookieHeader, csrfToken: csrfMatch ?? "" };
}

/** Authenticated POST/PATCH helper that carries both auth and CSRF cookies. */
export async function apiAuthRequest(
  method: "POST" | "PATCH" | "DELETE" | "GET",
  path: string,
  cookieHeader: string,
  csrfToken: string,
  body?: object,
) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
      "x-csrf-token": csrfToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

/** Create a project and return the created project object. */
export async function apiCreateProject(
  cookieHeader: string,
  csrfToken: string,
  name: string,
  wipLimit?: number,
) {
  const res = await apiAuthRequest(
    "POST",
    "/test02/create_project",
    cookieHeader,
    csrfToken,
    { name, description: `E2E test project ${name}`, wipLimit },
  );
  if (!res.ok) {
    throw new Error(`apiCreateProject failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Create a task and return the created task object. */
export async function apiCreateTask(
  cookieHeader: string,
  csrfToken: string,
  project_id: number,
  title: string,
  extra?: {
    description?: string;
    status?: string;
    priority?: string;
    assigneeIds?: number[];
  },
) {
  const res = await apiAuthRequest(
    "POST",
    "/test03/create_task",
    cookieHeader,
    csrfToken,
    {
      project_id,
      title,
      description: extra?.description ?? "",
      status: extra?.status ?? "Todo",
      priority: extra?.priority ?? "Medium",
      assigneeIds: extra?.assigneeIds ?? [],
    },
  );
  if (!res.ok) {
    throw new Error(`apiCreateTask failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Generate an invite code and return the invite object (includes .code). */
export async function apiCreateInvite(
  cookieHeader: string,
  csrfToken: string,
  projectId: number,
  maxUses = 10,
  expiresInDays = 7,
) {
  const res = await apiAuthRequest(
    "POST",
    "/invites",
    cookieHeader,
    csrfToken,
    { projectId, maxUses, expiresInDays },
  );
  if (!res.ok) {
    throw new Error(`apiCreateInvite failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Join a project via invite code. */
export async function apiJoinProject(
  cookieHeader: string,
  csrfToken: string,
  code: string,
) {
  const res = await apiAuthRequest(
    "POST",
    "/invites/join",
    cookieHeader,
    csrfToken,
    { code },
  );
  return res;
}

/** Delete a member by user_id using the test-cleanup endpoint. */
export async function apiCleanupUser(user_id: string) {
  await fetch(`${API_URL}/test01/test_cleanup`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, secret: TEST_SECRET }),
  }).catch(() => {});
}

/**
 * Log a user in via the browser page so cookies are set on the browser context.
 * Returns when the /projects page is reached.
 */
export async function browserLogin(
  page: import("@playwright/test").Page,
  user_id: string,
  password: string,
) {
  await page.goto(`${APP_URL}/login`);
  await page.fill("#user_id", user_id);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${APP_URL}/projects`, { timeout: 10_000 });
}

/**
 * Register a user via the browser UI.
 * Returns when the /projects page is reached.
 */
export async function browserRegister(
  page: import("@playwright/test").Page,
  user: ReturnType<typeof makeUser>,
) {
  await page.goto(`${APP_URL}/register`);
  await page.fill("#user_id", user.user_id);
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await page.fill("#confirmPassword", user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${APP_URL}/projects`, { timeout: 10_000 });
}
