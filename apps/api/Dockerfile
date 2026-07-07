# =========================
# Base
# =========================
FROM node:22-alpine AS base

WORKDIR /app
RUN npm install -g turbo
RUN corepack enable

# =========================
# Pruner — extract only the API workspace files
# =========================
FROM base AS pruner

COPY . .
RUN turbo prune api --docker

# =========================
# Installer — install deps from the pruned lockfile
# Installer — install deps from the pruned lockfile
# =========================
FROM base AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./

RUN npm ci

# =========================
# Builder — compile TypeScript + generate Prisma client
# Builder — compile TypeScript + generate Prisma client
# =========================
FROM base AS builder

WORKDIR /app

# DATABASE_URL is needed at build time for `prisma generate`.
# Pass it from Render's build args: Settings → Build & Deploy → Docker build arguments.
# It does NOT get baked into the final image — runtime reads it from env vars.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=pruner /app/out/full/ ./
COPY --from=pruner /app/out/package-lock.json ./

# Root-level node_modules (most packages live here after npm workspace hoisting)
COPY --from=installer /app/node_modules ./node_modules
# Also copy app-level node_modules — some packages (e.g. @nestjs/cache-manager)
# are not hoisted to the root by npm workspaces and live only here.
COPY --from=installer /app/apps/api/node_modules ./apps/api/node_modules

# App-level node_modules — npm does NOT always hoist every package to root.
# @nestjs/cache-manager is one that stays at the workspace level.
COPY --from=installer /app/apps/api/node_modules ./apps/api/node_modules

# Generate the Prisma client into apps/api/generated/prisma
RUN cd apps/api && npx prisma generate

# Compile the NestJS application
# Compile the NestJS application
RUN npx turbo run build --filter=api

# =========================
# Runner — minimal production image
# Runner — minimal production image
# =========================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

# Compiled NestJS output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Prisma generated client (required at runtime for all ORM calls)
COPY --from=builder /app/apps/api/generated ./apps/api/generated

# Node modules (root + app-level — same split as builder)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Prisma schema + migrations (needed by `prisma migrate deploy` in the entrypoint)
# Prisma schema + migrations (needed by `prisma migrate deploy` in the entrypoint)
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# prisma.config.ts — tells Prisma CLI where schema and migrations live.
# Prisma 7 can execute .ts config files via its own bundled executor.
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

# Entrypoint: runs migrate deploy then starts the app
COPY --from=builder /app/apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh \
 && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 8000

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]

