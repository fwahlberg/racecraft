# ---------- base ----------
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# Copy workspace metadata first for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/package.json

# Optional: warm pnpm store (cache only)
RUN pnpm -w fetch

# ---------- build ----------
FROM base AS build
# bring the repo
COPY . .
# reuse store cache
COPY --from=base /root/.local/share/pnpm/store /root/.local/share/pnpm/store

# install API deps (dev + prod so `nest` exists to build)
WORKDIR /app/apps/api
RUN pnpm install

# generate Prisma client & build
RUN pnpm prisma generate
RUN pnpm build

# prune to production deps for runtime
RUN pnpm prune --prod

# ---------- runtime ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/api

# enable pnpm in the runner so we can use `pnpm dlx`
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# copy compiled app and production deps
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/node_modules ./node_modules
# (store copy not needed because we won't rely on shipped prisma)

EXPOSE 3001

# ✅ fetch Prisma CLI on boot, apply migrations, then start Nest
CMD node -e "console.log('Applying migrations...')" \
 && pnpm dlx prisma@6 migrate deploy \
 && node dist/src/main.js