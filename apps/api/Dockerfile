# =========================
# Base
# =========================
FROM node:22-alpine AS base

WORKDIR /app
RUN npm install -g turbo
RUN corepack enable

# =========================
# Pruner
# =========================
FROM base AS pruner

COPY . .
RUN turbo prune api --docker

# =========================
# Installer
# =========================
FROM base AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./

RUN npm ci

# =========================
# Builder
# =========================
FROM base AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ ./
COPY --from=pruner /app/out/package-lock.json ./
COPY --from=installer /app/node_modules ./node_modules

RUN npx turbo run build --filter=api

# =========================
# Runner
# =========================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

# Copy everything as root first, so we can chmod before dropping privileges
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Prisma schema + CLI need to be present for `prisma migrate deploy` at runtime
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
# Entrypoint script (runs migrate deploy, then starts the app)
COPY --from=builder /app/apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh \
 && chown -R nestjs:nodejs /app

USER nestjs

ENTRYPOINT ["./docker-entrypoint.sh"]