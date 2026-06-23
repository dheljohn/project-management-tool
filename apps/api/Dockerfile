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
# FIX 1: Copy the package-lock.json file here so Turborepo can trace the workspace correctly
COPY --from=pruner /app/out/package-lock.json ./
COPY --from=installer /app/node_modules ./node_modules

RUN npx turbo run build --filter=api

# =========================
# Runner
# =========================
# FIX 2: Align with Node 22 to prevent engine mismatches
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

USER nestjs

# FIX 3: Copy files preserving the nested monorepo structure 
# and explicitly include node_modules so dependencies are available at runtime!
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

# FIX 4: Run from the correct matched directory paths

CMD ["node", "apps/api/dist/src/main.js"]

