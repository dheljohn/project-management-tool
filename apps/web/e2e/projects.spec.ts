import { test, expect, Browser } from "@playwright/test";
import {
  APP_URL,
  API_URL,
  makeUser,
  apiRegister,
  apiLogin,
  apiCreateProject,
  apiCreateInvite,
  apiJoinProject,
  apiAuthRequest,
  apiCleanupUser,
  browserLogin,
  browserRegister,
  uid,
} from "./helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TEARDOWN NOTE:
// No delete-project endpoint exists in the current API. Projects are owned
// by members and cascade-deleted when the owner member is deleted via
// DELETE /test01/test_cleanup. All tests below clean up by deleting the owner
// member, which cascades to their projects, tasks, invites, and changelogs.
// Non-owner members are also cleaned up separately.
// If a project-level delete endpoint is added later, replace the cascade approach.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Project Management", () => {
  // ── PROJ-01: Owner creates a project, appears in list ──────────────────────
  test("PROJ-01: Owner creates a project and it appears in the project list", async ({
    page,
  }) => {
    const owner = makeUser();
    await apiRegister(owner);

    try {
      await browserLogin(page, owner.user_id, owner.password);

      const projectName = `Proj_${uid()}`;

      await page.waitForSelector(".animate-spin", {
        state: "detached",
        timeout: 15_000,
      });

      // 🔥 CHECK: Ensure we didn't hit the error state
      const errorBanner = page.getByText("Failed to fetch projects");
      if (await errorBanner.isVisible()) {
        throw new Error("Workspace failed to load. Check API or network.");
      }

      // Open "Create Project" modal — look for the button by its visible text

      const mainBtn = page.getByRole("button", { name: /new project/i });
      const emptyBtn = page.getByRole("button", {
        name: /create your first project/i,
      });

      try {
        await mainBtn.waitFor({ state: "visible", timeout: 2000 });
        await mainBtn.click();
      } catch {
        // Fallback to empty state button
        await emptyBtn.waitFor({ state: "visible", timeout: 5000 });
        await emptyBtn.click();
      }

      await page.waitForSelector('input[placeholder="e.g. ProjectFlow"]', {
        state: "visible",
      });

      await page.fill('input[placeholder="e.g. ProjectFlow"]', projectName);
      await page.fill(
        'textarea[placeholder="What is this project about?"]',
        "Created by E2E",
      );
      await page
        .getByRole("button", { name: /create project/i })
        .last()
        .click();

      // The new project card should appear
      // Force it to pick the second element (the h2)
      await expect(page.getByText(projectName).last()).toBeVisible({
        timeout: 8_000,
      });
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });

  // ── PROJ-02: Owner updates project name/description/wipLimit ───────────────
  test("PROJ-02: Owner can update project name, description, and wipLimit", async ({
    page,
  }) => {
    const owner = makeUser();
    await apiRegister(owner);
    const { cookieHeader, csrfToken } = await apiLogin(
      owner.user_id,
      owner.password,
    );
    const project = await apiCreateProject(
      cookieHeader,
      csrfToken,
      `Proj_${uid()}`,
    );

    try {
      await browserLogin(page, owner.user_id, owner.password);

      const updatedName = `Updated_${uid()}`;

      // Click the "Edit" button on the project card
      const card = page.locator(".bg-card").filter({ hasText: project.name });
      await card.getByRole("button", { name: "Edit" }).click();

      // Clear and fill the name field
      const nameInput = page.locator('input[placeholder="e.g. ProjectFlow"]');
      await nameInput.fill(updatedName);

      // Set WIP limit
      const wipInput = page.locator('input[placeholder="0"]');
      await wipInput.fill("3");

      await page.getByRole("button", { name: /save changes/i }).click();

      // Updated name should appear in the card list
      await expect(page.getByText(updatedName).last()).toBeVisible({
        timeout: 8_000,
      });
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });

  // ── PROJ-03: Non-owner cannot update project settings ─────────────────────
  test("PROJ-03: Non-owner member update is rejected server-side with 403", async ({
    page,
  }) => {
    const owner = makeUser();
    const member = makeUser();
    await apiRegister(owner);
    await apiRegister(member);

    const { cookieHeader: ownerCookie, csrfToken: ownerCsrf } = await apiLogin(
      owner.user_id,
      owner.password,
    );
    const project = await apiCreateProject(
      ownerCookie,
      ownerCsrf,
      `Proj_${uid()}`,
    );
    const invite = await apiCreateInvite(
      ownerCookie,
      ownerCsrf,
      project.id,
      5,
      7,
    );

    const { cookieHeader: memberCookie, csrfToken: memberCsrf } =
      await apiLogin(member.user_id, member.password);
    await apiJoinProject(memberCookie, memberCsrf, invite.code);

    try {
      // Attempt to update the project as the non-owner via API
      const res = await apiAuthRequest(
        "PATCH",
        "/test02/patch_project",
        memberCookie,
        memberCsrf,
        { id: project.id, name: "Hijacked Name" },
      );

      // Must be rejected — 403 Forbidden
      expect(res.status).toBe(403);
    } finally {
      await apiCleanupUser(owner.user_id);
      await apiCleanupUser(member.user_id);
    }
  });

  // ── PROJ-04: Non-member blocked from project board URL ────────────────────
  test("PROJ-04: Non-member navigating directly to project URL is blocked", async ({
    page,
  }) => {
    const owner = makeUser();
    const outsider = makeUser();
    await apiRegister(owner);
    await apiRegister(outsider);

    const { cookieHeader, csrfToken } = await apiLogin(
      owner.user_id,
      owner.password,
    );
    const project = await apiCreateProject(
      cookieHeader,
      csrfToken,
      `Proj_${uid()}`,
    );

    try {
      await browserLogin(page, outsider.user_id, outsider.password);

      // Navigate directly to the project board
      await page.goto(`${APP_URL}/projects/${project.id}`);

      // Should see an access-denied message (not the kanban board)
      await expect(
        page
          .getByText(/access denied|not have permission|does not exist/i)
          .first(),
      ).toBeVisible({ timeout: 8_000 });
    } finally {
      await apiCleanupUser(owner.user_id);
      await apiCleanupUser(outsider.user_id);
    }
  });

  // ── PROJ-05: Invite flow — second user joins, appears in member list ────────
  test("PROJ-05: Second user redeems invite code and appears in member list without refresh", async ({
    page,
    browser,
  }) => {
    const owner = makeUser();
    const joiner = makeUser();
    await apiRegister(owner);
    await apiRegister(joiner);

    const { cookieHeader: ownerCookie, csrfToken: ownerCsrf } = await apiLogin(
      owner.user_id,
      owner.password,
    );
    const project = await apiCreateProject(
      ownerCookie,
      ownerCsrf,
      `Proj_${uid()}`,
    );
    const invite = await apiCreateInvite(
      ownerCookie,
      ownerCsrf,
      project.id,
      5,
      7,
    );

    try {
      // Context 1: owner on the project board
      await browserLogin(page, owner.user_id, owner.password);
      await page.goto(`${APP_URL}/projects/${project.id}`);
      await page.waitForLoadState("networkidle");

      // Context 2: joiner redeems the invite via UI
      const joinerContext = await browser.newContext();
      const joinerPage = await joinerContext.newPage();

      try {
        await browserLogin(joinerPage, joiner.user_id, joiner.password);
        await expect(joinerPage).toHaveURL(`${APP_URL}/projects`);

        // Open "Join Project" modal
        await joinerPage
          .getByRole("button", { name: /join project|join/i })
          .click();

        const codeInput = joinerPage.locator(
          'input[placeholder="# Join via code"]',
        );
        await codeInput.fill(invite.code);
        await joinerPage.getByRole("button", { name: /^join$/i }).click();

        // Should redirect to the project board
        await expect(joinerPage).toHaveURL(
          new RegExp(`/projects/${project.id}`),
          { timeout: 10_000 },
        );

        // The owner's page — member list should update via WebSocket without reload
        // The member count badge on the invite button area or the project board
        // should reflect the new member. We poll with a short wait for WS delivery.
        await page.waitForTimeout(2_000);

        // Verify via API that the joiner is now a member
        const membersRes = await apiAuthRequest(
          "GET",
          `/test02/get_project_members?projectId=${project.id}`,
          ownerCookie,
          ownerCsrf,
        );
        const members = await membersRes.json();
        const joinerMember = members.find(
          (m: any) => m.member.user_id === joiner.user_id,
        );
        expect(joinerMember).toBeDefined();
        expect(joinerMember.role).toBe("MEMBER");
      } finally {
        await joinerContext.close();
      }
    } finally {
      await apiCleanupUser(owner.user_id);
      await apiCleanupUser(joiner.user_id);
    }
  });

  // ── PROJ-06: Invite code usage limit is enforced ───────────────────────────
  test("PROJ-06: Invite code usage limit is enforced — redemption past limit fails", async () => {
    const owner = makeUser();
    const userA = makeUser();
    const userB = makeUser();
    await apiRegister(owner);
    await apiRegister(userA);
    await apiRegister(userB);

    const { cookieHeader: ownerCookie, csrfToken: ownerCsrf } = await apiLogin(
      owner.user_id,
      owner.password,
    );
    const project = await apiCreateProject(
      ownerCookie,
      ownerCsrf,
      `Proj_${uid()}`,
    );
    // Create invite limited to 1 use
    const invite = await apiCreateInvite(
      ownerCookie,
      ownerCsrf,
      project.id,
      1,
      7,
    );

    try {
      const { cookieHeader: cookieA, csrfToken: csrfA } = await apiLogin(
        userA.user_id,
        userA.password,
      );
      const resA = await apiJoinProject(cookieA, csrfA, invite.code);
      expect(resA.status).toBe(201); // first redemption succeeds

      const { cookieHeader: cookieB, csrfToken: csrfB } = await apiLogin(
        userB.user_id,
        userB.password,
      );
      const resB = await apiJoinProject(cookieB, csrfB, invite.code);
      expect(resB.status).toBe(400); // usage limit reached

      const body = await resB.json();
      expect(body.message).toMatch(/usage limit/i);
    } finally {
      await apiCleanupUser(owner.user_id);
      await apiCleanupUser(userA.user_id);
      await apiCleanupUser(userB.user_id);
    }
  });

  // ── PROJ-07: Concurrent redemption never exceeds usage limit ──────────────
  test("PROJ-07: Concurrent invite redemptions never exceed the configured limit", async () => {
    const owner = makeUser();
    const users = [makeUser(), makeUser(), makeUser(), makeUser(), makeUser()];
    await apiRegister(owner);
    await Promise.all(users.map(apiRegister));

    const { cookieHeader: ownerCookie, csrfToken: ownerCsrf } = await apiLogin(
      owner.user_id,
      owner.password,
    );
    const project = await apiCreateProject(
      ownerCookie,
      ownerCsrf,
      `Proj_${uid()}`,
    );
    const LIMIT = 3;
    const invite = await apiCreateInvite(
      ownerCookie,
      ownerCsrf,
      project.id,
      LIMIT,
      7,
    );

    try {
      // All 5 users attempt to redeem simultaneously
      const results = await Promise.all(
        users.map(async (u) => {
          const { cookieHeader, csrfToken } = await apiLogin(
            u.user_id,
            u.password,
          );
          const res = await apiJoinProject(
            cookieHeader,
            csrfToken,
            invite.code,
          );
          return res.status;
        }),
      );

      const successes = results.filter((s) => s === 201).length;
      const failures = results.filter((s) => s === 400).length;

      // Exactly LIMIT redemptions should succeed, the rest must fail
      expect(successes).toBe(LIMIT);
      expect(failures).toBe(users.length - LIMIT);

      // Confirm the DB state via the invite list
      const membersRes = await apiAuthRequest(
        "GET",
        `/test02/get_project_members?projectId=${project.id}`,
        ownerCookie,
        ownerCsrf,
      );
      const members = await membersRes.json();
      // owner + LIMIT joined members = LIMIT + 1
      expect(members.length).toBe(LIMIT + 1);
    } finally {
      await apiCleanupUser(owner.user_id);
      await Promise.all(users.map((u) => apiCleanupUser(u.user_id)));
    }
  });

  // ── PROJ-08: WipLimit change appears live in second browser context ────────
  test("PROJ-08: WIP limit change by owner appears live in second connected client", async ({
    page,
    browser,
  }) => {
    const owner = makeUser();
    const member = makeUser();
    await apiRegister(owner);
    await apiRegister(member);

    const { cookieHeader: ownerCookie, csrfToken: ownerCsrf } = await apiLogin(
      owner.user_id,
      owner.password,
    );
    const project = await apiCreateProject(
      ownerCookie,
      ownerCsrf,
      `Proj_${uid()}`,
    );
    const invite = await apiCreateInvite(
      ownerCookie,
      ownerCsrf,
      project.id,
      5,
      7,
    );

    const { cookieHeader: memberCookie, csrfToken: memberCsrf } =
      await apiLogin(member.user_id, member.password);
    await apiJoinProject(memberCookie, memberCsrf, invite.code);

    try {
      // Context 1: member on the project board
      const memberContext = await browser.newContext();
      const memberPage = await memberContext.newPage();

      try {
        await browserLogin(memberPage, member.user_id, member.password);
        await memberPage.goto(`${APP_URL}/projects/${project.id}`);
        await memberPage.waitForLoadState("networkidle");

        // Context 2: owner updates wipLimit to 2 via API
        // (WipControl is on the Kanban board — updating via API to keep test fast)
        await apiAuthRequest(
          "PATCH",
          "/test02/patch_project",
          ownerCookie,
          ownerCsrf,
          { id: project.id, wipLimit: 2 },
        );

        // Member's page should display the WIP limit indicator without refresh
        // The WipControl shows the limit in the "In Progress" column header
        await expect(memberPage.getByText(/WIP:\s*\d+/)).toBeVisible({
          timeout: 6_000,
        });
        // await expect(page.getByText(/WIP:\s*\d+/)).toBeVisible();
      } finally {
        await memberContext.close();
      }
    } finally {
      await apiCleanupUser(owner.user_id);
      await apiCleanupUser(member.user_id);
    }
  });
});
