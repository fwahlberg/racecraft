# ---------- base ----------
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# Copy workspace metadata first (for layer caching)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/package.json

# Optional: warm pnpm store for cache (network is available on Render)
RUN pnpm -w fetch

# ---------- build ----------
FROM base AS build
# bring repo files
COPY . .
# reuse store cache
COPY --from=base /root/.local/share/pnpm/store /root/.local/share/pnpm/store

# Install API deps INCLUDING dev deps so `nest` is available
WORKDIR /app/apps/api
RUN pnpm install

# Generate Prisma client and compile
RUN pnpm prisma generate
RUN pnpm build

# Prune node_modules to production-only to keep runtime image small
RUN pnpm prune --prod

# ---------- runtime ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/api

# Copy compiled app, prod node_modules, prisma schema, manifest
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/package.json ./package.json

# Copy pnpm store so symlinks in node_modules resolve
COPY --from=build /root/.local/share/pnpm/store /root/.local/share/pnpm/store

EXPOSE 3001
# Run migrations with the local Prisma CLI, then start
CMD node -e "console.log('Applying migrations...')" \
 && ./node_modules/.bin/prisma migrate deploy \
 && node dist/main.js
