# ---------- base ----------
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# ---------- prep (lock + store for cache) ----------
# copy workspace manifests first for better layer cache
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/package.json
# populate pnpm store (helps cache), but we won't force offline later
RUN pnpm -w fetch --prod

# ---------- build ----------
FROM base AS build
# bring in the repo
COPY . .
# reuse the prefetched store
COPY --from=base /root/.local/share/pnpm/store /root/.local/share/pnpm/store

# install ONLY the API's production deps into apps/api/node_modules (online)
RUN pnpm --filter ./apps/api... install --prod

# generate prisma client and build the API
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

# ---------- runtime ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/api

# copy built app and dependencies
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/node_modules ./node_modules
# copy the pnpm store so symlinks in node_modules resolve
COPY --from=build /root/.local/share/pnpm/store /root/.local/share/pnpm/store

EXPOSE 3001

# If prisma CLI is in apps/api dependencies (recommended)
CMD node -e "console.log('Applying migrations...')" \
 && ./node_modules/.bin/prisma migrate deploy \
 && node dist/main.js
