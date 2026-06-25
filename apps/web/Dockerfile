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
RUN turbo prune web --docker

# =========================
# Installer (deps only)
# =========================
FROM base AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./

RUN npm ci

# =========================
# Builder
# =========================
# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

# 1. Copy the full source code 
COPY --from=pruner /app/out/full/ ./

# FIX: Copy the root lockfile here so Next.js/Turbopack can infer the workspace root!
COPY --from=pruner /app/out/package-lock.json ./

# 2. Copy node_modules from installer 
COPY --from=installer /app/node_modules ./node_modules

# 3. Run the build
RUN npx turbo run build --filter=web


# =========================
# Runner (Next standalone)
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

USER nextjs

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]