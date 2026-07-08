# Proyekto

A Kanban-style project management tool built for the **Dowinn Group IT Assessment**.

Proyekto lets teams create projects, manage tasks on a drag-and-drop board, invite collaborators via codes, and see every change reflected live across all open browser sessions without a refresh.

**Live URLs**

| Service                                                       | URL                                    |
| ------------------------------------------------------------- | -------------------------------------- |
| Frontend (Vercel)                                             | https://proyekto-blue.vercel.app       |
| API (Render)                                                  | https://proyekto.onrender.com          |
| Swagger UI (Disabled in production, available when running locally ) | http://localhost:8000/api-docs         |

---

## Tech Stack

| Layer      | Technology                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), React 19, TanStack Query v5, Tailwind CSS v4, `@dnd-kit/react`, Axios, Zod, `socket.io-client` |
| Backend    | NestJS v11, Passport JWT, `@nestjs/throttler`, `@nestjs/swagger`, Socket.IO                                             |
| Database   | PostgreSQL via [Neon](https://neon.tech) (serverless), Prisma v7 ORM                                                    |
| Cache      | Redis via [Upstash](https://upstash.com) (`cache-manager-redis-yet`)                                                    |
| Auth       | httpOnly cookie JWT — access token (15 min) + refresh token (7 days, DB-tracked rotation)                               |
| Build      | Turborepo monorepo (`apps/api`, `apps/web`)                                                                             |
| Deployment | Render (API, Docker) + Vercel (Frontend)                                                                                |

---

## Assessment Feature Coverage

| Required Feature             | Implemented | Notes                                                                                              |
| ---------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| User registration & login    | ✅          | `POST /test01/create_member`, `POST /testlogin`; bcrypt password hashing                           |
| Session management           | ✅          | httpOnly JWT cookies; access + refresh token pair; token rotation on refresh                       |
| Drag-and-drop status update  | ✅          | `@dnd-kit/react`; WIP limit enforced on "In Progress" column                                       |
| Change log with API endpoint | ✅          | `GET /test04/get_change_log_by_project` — cursor-paginated, date-grouped, filterable by field type |
| DB seed / init endpoint      | ✅          | `POST /seed` — wipes and recreates demo data (see Seed section below)                              |
| Project CRUD                 | ✅          | Create, read (all + by user), update name/description/wipLimit                                     |
| Task CRUD                    | ✅          | Create with title/description/status/priority/assignees; update all fields                         |

---

## Additional Features (Beyond Requirements)

- **Real-time sync via WebSocket** — Task creates/updates, project changes, and new changelog entries broadcast instantly to all connected clients on the same project board using Socket.IO.
- **Multi-assignee tasks** — Each task supports multiple assignees; assignee candidates are restricted to project members.
- **Invite-code collaboration** — Project owners generate time-limited, usage-capped invite codes. Other users join via an 8-character code. Race-condition-safe redemption via a guarded DB transaction.
- **Role-based access** — `OWNER` vs `MEMBER` roles. Only the OWNER can update project settings or generate invite codes.
- **WIP limit** — Optional per-project "Work In Progress" limit; the board visually blocks dragging additional tasks into the "In Progress" column when the limit is reached.
- **Cursor-based pagination** — The changelog endpoint supports infinite scroll with cursor pagination and field-type filtering.
- **CSRF protection** — Hand-rolled double-submit cookie pattern applied globally to all mutating routes.
- **Rate limiting** — Login rate-limited to 10 attempts per minute via `@nestjs/throttler`.
- **Redis caching** — Project lists, task lists, and changelog pages cached in Upstash Redis with targeted invalidation on writes.
- **Confetti** — `canvas-confetti` fires when all tasks in a project reach "Done".
- **Dark / Light theme** — Toggleable via the settings sheet.
- **Playwright E2E tests** — Auth, project, task, and changelog flows with data isolation and teardown.

---

## Running Locally

Both options connect to the same online services (Neon PostgreSQL + Upstash Redis) — no local database or cache containers needed.

### Prerequisites

- [Git](https://git-scm.com)
- Node.js ≥ 18 + npm ≥ 11 _(npm path only)_
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) _(Docker path only)_

### 1. Clone the repo

```bash
git clone https://github.com/dheljohn/project-management-tool.git
cd project-management-tool
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in these values (leave the rest as-is):

```env
DATABASE_URL=       # Neon pooled connection string
REDIS_URL=          # Upstash rediss:// connection string
JWT_ACCESS_SECRET=  # any long random string
JWT_REFRESH_SECRET= # a different long random string
TEST_SECRET=        # any string (used by E2E test cleanup)
```

> The remaining variables (`FRONTEND_URL`, `API_URL`, `DOCKER_API`) already have correct defaults in `.env.example` for local use — no changes needed.

---

### Option A — Docker Compose

Builds and runs both apps in containers. No Node.js installation required.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000

To stop: `Ctrl+C` then `docker compose down`

---

### Option B — npm (local dev servers)

Runs both apps natively with hot-reload. Faster iteration than Docker.

```bash
# Install all dependencies (run once)
npm install

# Generate the Prisma client (creates typed DB access based on schema.prisma)
npx prisma generate --schema=apps/api/prisma/schema.prisma

# Start both API and frontend in parallel
npm run dev || turbo run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:8000

Both dev scripts automatically load from the root `.env` via `dotenv-cli` — no extra configuration needed.

To run each app individually:

```bash
# API only (from repo root)
cd apps/api && npm run dev

# Frontend only (from repo root)
cd apps/web && npm run dev
```

---

### 3. Seed demo data (optional)

With the API running (either option), seed a demo project with three pre-made accounts:

```bash
# bash / macOS / Linux
curl -X POST http://localhost:8000/seed

# PowerShell (Windows)
curl.exe -X POST http://localhost:8000/seed
```

| user_id      | password      | role   |
| ------------ | ------------- | ------ |
| `john_doe`   | `password123` | OWNER  |
| `sasha_iyer` | `password123` | MEMBER |
| `mira_chen`  | `password123` | MEMBER |

> **Warning:** The seed endpoint wipes all existing data before seeding.

---

## Deployment

### Render (API)

The API deploys as a Docker container from the repo's `apps/api/Dockerfile`.

**Environment Variables** (set in Render dashboard → Environment):

| Key                  | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`       | Neon pooled connection string                                |
| `REDIS_URL`          | Upstash `rediss://` connection string                        |
| `JWT_ACCESS_SECRET`  | Long random string (generate with `openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | Different long random string                                 |
| `FRONTEND_URL`       | `https://proyekto-blue.vercel.app` (no trailing slash)       |
| `TEST_SECRET`        | Any string (used by E2E test cleanup endpoint)               |

**Docker Build Arguments** (Render → Settings → Build & Deploy → Docker build arguments):

| Key            | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL` | Same Neon connection string — needed at build time for `prisma generate` |

### Vercel (Frontend)

The frontend deploys as a standard Next.js app. Set these in your Vercel project's Environment Variables:

| Key                   | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `https://proyekto.onrender.com` — baked into the client bundle at build time          |
| `JWT_ACCESS_SECRET`   | Same value as Render — read server-side by Next.js middleware to verify access tokens |

After setting `NEXT_PUBLIC_API_URL`, trigger a fresh Vercel deployment to pick it up.

---

## Known Issues & Limitations

**API controller route naming** — Routes use temporary names (`/test01`, `/test02`, `/test03`, `/test04`, `/testlogin`) that reflect the origin as assessment scaffolding. A real production app would use `/auth`, `/members`, `/projects`, `/tasks`, `/changelog`. Renaming was deprioritised to avoid breaking changes during active assessment.

**No project deletion** — There is no delete-project or delete-task endpoint. Data can only be removed via the seed endpoint (which wipes everything) or direct DB access. This was not part of the assessment requirements but is the most obvious gap for a production tool.

**Render cold starts** — Render's free tier spins down idle services. The first request after inactivity may take 30–60 seconds. Subsequent requests are fast.

**WebSocket on free Render tier** — Socket.IO connections work but may be dropped during Render's automatic restarts on the free plan. The client reconnects automatically; in-progress mutations are not lost since they go through the REST API.

**No password reset flow** — `PATCH /test01/update_member` lets users change their password if they know the current one. A forgot-password/email flow is not implemented.

**E2E tests require a running stack** — Playwright tests run against the real app (`localhost:3000` + `localhost:8000`). There is no mocked or in-memory mode.
