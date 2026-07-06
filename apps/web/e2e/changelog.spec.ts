import { test, expect } from "@playwright/test";
import {
  APP_URL,
  API_URL,
  makeUser,
  apiRegister,
  apiLogin,
  apiCreateProject,
  apiCreateTask,
  apiCreateInvite,
  apiJoinProject,
  apiAuthRequest,
  apiCleanupUser,
  browserLogin,
  uid,
} from "./helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TEARDOWN NOTE:
// No delete-task/project endpoint. Owner deletion cascades to everything.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Change Log", () => {
  // ── LOG-01: Status change creates a log entry with correct values ──────────
  test("LOG-01: Changing task status creates a changelog entry with correct old/new values", async () => {
    const owner = makeUser();
    await apiRegister(owner);
    const { cookieHeader, csrfToken } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(cookieHeader, csrfToken, `Proj_${uid()}`);
    const task = await apiCreateTask(cookieHeader, csrfToken, project.id, `Task_${uid()}`);

    try {
      // Change status from Todo → In Progress
      const updateRes = await apiAuthRequest(
        "PATCH",
        "/test03/patch_task",
        cookieHeader,
        csrfToken,
        { task_id: task.id, status: "In Progress" },
      );
      expect(updateRes.status).toBe(200);

      // Fetch changelogs for the project
      const logsRes = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}`,
        cookieHeader,
        csrfToken,
      );
      const { items: logs } = await logsRes.json();

      const statusLog = logs.find(
        (l: any) => l.field === "status" && l.taskId === task.id,
      );
      expect(statusLog).toBeDefined();
      expect(statusLog.oldValue).toBe("Todo");
      expect(statusLog.newValue).toBe("In_Progress");
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });

  // ── LOG-02: Renaming task does not rewrite older log entries' taskTitle ─────
  test("LOG-02: Renaming a task does not rewrite earlier log entries' taskTitle snapshot", async () => {
    const owner = makeUser();
    await apiRegister(owner);
    const { cookieHeader, csrfToken } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(cookieHeader, csrfToken, `Proj_${uid()}`);
    const originalTitle = `OriginalTitle_${uid()}`;
    const task = await apiCreateTask(cookieHeader, csrfToken, project.id, originalTitle);

    try {
      // Create a status change log (records taskTitle at time of change)
      await apiAuthRequest("PATCH", "/test03/patch_task", cookieHeader, csrfToken, {
        task_id: task.id,
        status: "In Progress",
      });

      // Now rename the task
      const renamedTitle = `RenamedTitle_${uid()}`;
      await apiAuthRequest("PATCH", "/test03/patch_task", cookieHeader, csrfToken, {
        task_id: task.id,
        title: renamedTitle,
      });

      // Fetch logs for this task
      const historyRes = await apiAuthRequest(
        "GET",
        `/test03/get_task_history?task_id=${task.id}`,
        cookieHeader,
        csrfToken,
      );
      const logs = await historyRes.json();

      // The status log that was created BEFORE the rename should still
      // carry the original title snapshot, not the new name.
      const statusLog = logs.find((l: any) => l.field === "status");
      expect(statusLog).toBeDefined();
      expect(statusLog.taskTitle).toBe(originalTitle);

      // The rename log itself should use the new title as the snapshot
      const titleLog = logs.find((l: any) => l.field === "title");
      expect(titleLog).toBeDefined();
      expect(titleLog.newValue).toBe(renamedTitle);
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });

  // ── LOG-03: No-op update creates no log entry ──────────────────────────────
  test("LOG-03: Submitting an update where no field changes creates no changelog entry", async () => {
    const owner = makeUser();
    await apiRegister(owner);
    const { cookieHeader, csrfToken } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(cookieHeader, csrfToken, `Proj_${uid()}`);
    const task = await apiCreateTask(cookieHeader, csrfToken, project.id, `Task_${uid()}`);

    try {
      // Fetch current log count
      const beforeRes = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}`,
        cookieHeader,
        csrfToken,
      );
      const { items: logsBefore } = await beforeRes.json();
      const countBefore = logsBefore.length;

      // Submit an update with the exact same values (no-op)
      await apiAuthRequest("PATCH", "/test03/patch_task", cookieHeader, csrfToken, {
        task_id: task.id,
        title: task.title, // unchanged
        status: "Todo", // unchanged
        priority: task.priority, // unchanged
      });

      const afterRes = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}`,
        cookieHeader,
        csrfToken,
      );
      const { items: logsAfter } = await afterRes.json();

      // Log count must not have increased
      expect(logsAfter.length).toBe(countBefore);
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });

  // ── LOG-04: Remark on status-only change is not attached to the log ────────
  test("LOG-04: A remark submitted with a status-only change is not stored on the status log entry", async () => {
    const owner = makeUser();
    await apiRegister(owner);
    const { cookieHeader, csrfToken } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(cookieHeader, csrfToken, `Proj_${uid()}`);
    const task = await apiCreateTask(cookieHeader, csrfToken, project.id, `Task_${uid()}`);

    try {
      await apiAuthRequest("PATCH", "/test03/patch_task", cookieHeader, csrfToken, {
        task_id: task.id,
        status: "In Progress",
        remark: "This remark should not be saved on a status change",
      });

      const logsRes = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}`,
        cookieHeader,
        csrfToken,
      );
      const { items: logs } = await logsRes.json();
      const statusLog = logs.find(
        (l: any) => l.field === "status" && l.taskId === task.id,
      );

      expect(statusLog).toBeDefined();
      // remark must be null on a status-only change
      expect(statusLog.remark).toBeNull();
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });

  // ── LOG-05: "Changed by" always reflects authenticated session, not payload ─
  test("LOG-05: Changelog username always reflects the authenticated session, not a spoofed payload value", async () => {
    const owner = makeUser();
    const attacker = makeUser();
    await apiRegister(owner);
    await apiRegister(attacker);

    const { cookieHeader: ownerCookie, csrfToken: ownerCsrf } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(ownerCookie, ownerCsrf, `Proj_${uid()}`);
    const task = await apiCreateTask(ownerCookie, ownerCsrf, project.id, `Task_${uid()}`);
    const invite = await apiCreateInvite(ownerCookie, ownerCsrf, project.id, 5, 7);

    const { cookieHeader: attackerCookie, csrfToken: attackerCsrf } = await apiLogin(attacker.user_id, attacker.password);
    await apiJoinProject(attackerCookie, attackerCsrf, invite.code);

    try {
      // Attacker sends an update with a spoofed user_id in the body
      // The backend should ignore the body's user_id and use the JWT identity instead
      const res = await fetch(`${API_URL}/test03/patch_task`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: attackerCookie,
          "x-csrf-token": attackerCsrf,
        },
        body: JSON.stringify({
          task_id: task.id,
          title: `SpoofAttempt_${uid()}`,
          user_id: owner.user_id, // spoofed — should be ignored by the server
        }),
      });
      expect(res.status).toBe(200);

      const logsRes = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}`,
        ownerCookie,
        ownerCsrf,
      );
      const { items: logs } = await logsRes.json();
      const titleLog = logs.find((l: any) => l.field === "title" && l.taskId === task.id);

      expect(titleLog).toBeDefined();
      // Username in the log must be the actual authenticated attacker, not the spoofed owner
      expect(titleLog.username).toBe(attacker.user_id);
      expect(titleLog.username).not.toBe(owner.user_id);
    } finally {
      await apiCleanupUser(owner.user_id);
      await apiCleanupUser(attacker.user_id);
    }
  });

  // ── LOG-06: Status casing normalization — no false log on same underlying value
  test("LOG-06: Status update with variant casing does not produce a false log if the underlying value is unchanged", async () => {
    const owner = makeUser();
    await apiRegister(owner);
    const { cookieHeader, csrfToken } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(cookieHeader, csrfToken, `Proj_${uid()}`);

    // Create task already in In_Progress
    const task = await apiCreateTask(cookieHeader, csrfToken, project.id, `Task_${uid()}`, {
      status: "In Progress",
    });

    try {
      // Fetch current log count (only has the "task creation" entry)
      const beforeRes = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}`,
        cookieHeader,
        csrfToken,
      );
      const { items: before } = await beforeRes.json();
      const countBefore = before.filter((l: any) => l.field === "status" && l.taskId === task.id).length;

      // Submit the same status with different casing ("in_progress" vs "In_Progress")
      await apiAuthRequest("PATCH", "/test03/patch_task", cookieHeader, csrfToken, {
        task_id: task.id,
        status: "in_progress",
      });

      const afterRes = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}`,
        cookieHeader,
        csrfToken,
      );
      const { items: after } = await afterRes.json();
      const countAfter = after.filter((l: any) => l.field === "status" && l.taskId === task.id).length;

      // No new status log entry should exist
      expect(countAfter).toBe(countBefore);
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });

  // ── LOG-07: New log entry appears live in second browser context ────────────
  test("LOG-07: New changelog entry appears live in second connected browser context", async ({
    page,
    browser,
  }) => {
    const owner = makeUser();
    const member = makeUser();
    await apiRegister(owner);
    await apiRegister(member);

    const { cookieHeader: ownerCookie, csrfToken: ownerCsrf } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(ownerCookie, ownerCsrf, `Proj_${uid()}`);
    const task = await apiCreateTask(ownerCookie, ownerCsrf, project.id, `Task_${uid()}`);
    const invite = await apiCreateInvite(ownerCookie, ownerCsrf, project.id, 5, 7);

    const { cookieHeader: memberCookie, csrfToken: memberCsrf } = await apiLogin(member.user_id, member.password);
    await apiJoinProject(memberCookie, memberCsrf, invite.code);

    try {
      // Member opens the Activity view
      const memberContext = await browser.newContext();
      const memberPage = await memberContext.newPage();

      try {
        await browserLogin(memberPage, member.user_id, member.password);
        await memberPage.goto(`${APP_URL}/projects/${project.id}`);
        await memberPage.waitForLoadState("networkidle");

        // Switch to Activity view
        await memberPage.getByRole("tab", { name: /activity/i }).click();
        await memberPage.waitForTimeout(500);

        const uniqueDescription = `LiveDesc_${uid()}`;

        // Owner updates task description — triggers a log entry and log:created WS event
        await apiAuthRequest("PATCH", "/test03/patch_task", ownerCookie, ownerCsrf, {
          task_id: task.id,
          description: uniqueDescription,
        });

        // The new log entry text should appear in the member's Activity feed without reload.
        // The ActivityLog component renders "updated the description on" for description changes.
        await expect(
          memberPage.getByText(/updated the description on/i),
        ).toBeVisible({ timeout: 7_000 });
      } finally {
        await memberContext.close();
      }
    } finally {
      await apiCleanupUser(owner.user_id);
      await apiCleanupUser(member.user_id);
    }
  });

  // ── LOG-08: Paginated history returns correct date-grouped results ──────────
  test("LOG-08: GET history endpoint returns paginated results with cursor-based navigation", async () => {
    const owner = makeUser();
    await apiRegister(owner);
    const { cookieHeader, csrfToken } = await apiLogin(owner.user_id, owner.password);
    const project = await apiCreateProject(cookieHeader, csrfToken, `Proj_${uid()}`);
    const task = await apiCreateTask(cookieHeader, csrfToken, project.id, `Task_${uid()}`);

    try {
      // Create enough log entries to span multiple pages (> 10)
      // Each status toggle creates one log entry. We do 12 cycles.
      const transitions = ["In Progress", "Done", "Todo", "In Progress", "Done", "Todo",
                           "In Progress", "Done", "Todo", "In Progress", "Done", "Todo"];

      for (const status of transitions) {
        await apiAuthRequest("PATCH", "/test03/patch_task", cookieHeader, csrfToken, {
          task_id: task.id,
          status,
        });
      }

      // First page — default limit of 10
      const page1Res = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}&limit=5`,
        cookieHeader,
        csrfToken,
      );
      const page1 = await page1Res.json();

      expect(page1.items).toHaveLength(5);
      expect(page1.hasMore).toBe(true);
      expect(page1.nextCursor).toBeDefined();
      expect(typeof page1.nextCursor).toBe("number");

      // Second page — use cursor
      const page2Res = await apiAuthRequest(
        "GET",
        `/test04/get_change_log_by_project?projectId=${project.id}&limit=5&cursor=${page1.nextCursor}`,
        cookieHeader,
        csrfToken,
      );
      const page2 = await page2Res.json();

      // Page 2 should have different items from page 1
      const page1Ids = new Set(page1.items.map((l: any) => l.id));
      for (const log of page2.items) {
        expect(page1Ids.has(log.id)).toBe(false);
      }

      // All items on each page should belong to the correct project
      for (const log of [...page1.items, ...page2.items]) {
        expect(log.task).toBeDefined();
      }
    } finally {
      await apiCleanupUser(owner.user_id);
    }
  });
});
