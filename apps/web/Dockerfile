# =========================
# Base
# =========================
FROM node:22-alpine AS base

WORKDIR /app
RUN npm install -g turbo
RUN corepack enable

# =========================
# Pruner — extract only the web workspace files
# =========================
FROM base AS pruner

COPY . .
RUN turbo prune web --docker

# =========================
# Installer — install deps from the pruned lockfile
# =========================
FROM base AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./

RUN npm ci

# =========================
# Builder — compile Next.js
# =========================
FROM base AS builder

WORKDIR /app

# NEXT_PUBLIC_API_URL is baked into the client bundle at build time.
# For Docker Compose local builds: http://localhost:8000
# For Vercel: set in Vercel dashboard, not here.
# This ARG lets docker-compose pass the value in at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=pruner /app/out/full/ ./
COPY --from=pruner /app/out/package-lock.json ./
COPY --from=installer /app/node_modules ./node_modules

RUN npx turbo run build --filter=web

# =========================
# Runner — Next.js standalone
# =========================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

USER nextjs

# Next.js standalone output (includes server.js and all server-side code)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# Public folder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
