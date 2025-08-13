# ---------- base ----------
    FROM node:20-alpine AS base
    RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
    WORKDIR /app
    
    # ---------- prepare lock/store for caching ----------
    # Copy only the workspace metadata & the api package.json first
    COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
    COPY apps/api/package.json ./apps/api/package.json
    
    # Pre-fetch packages referenced by the lockfile into pnpm store (no node_modules yet)
    RUN pnpm -w fetch --prod
    
    # ---------- build ----------
    FROM base AS build
    # bring in the full repo (sources)
    COPY . .
    # reuse the prefetched store
    COPY --from=base /root/.local/share/pnpm/store /root/.local/share/pnpm/store
    
    # Install ONLY the API's production dependencies into apps/api/node_modules
    RUN pnpm --filter ./apps/api... install --prod --offline
    
    # Generate Prisma client and build the API
    WORKDIR /app/apps/api
    RUN pnpm prisma generate
    RUN pnpm build
    
    # ---------- runtime ----------
    FROM node:20-alpine AS runner
    ENV NODE_ENV=production
    
    # The API will run from /app/apps/api
    WORKDIR /app/apps/api
    
    # Copy the API dist, package manifest, prisma folder, and its node_modules
    COPY --from=build /app/apps/api/dist ./dist
    COPY --from=build /app/apps/api/package.json ./package.json
    COPY --from=build /app/apps/api/prisma ./prisma
    COPY --from=build /app/apps/api/node_modules ./node_modules
    
    # IMPORTANT: copy the pnpm store so symlinks in node_modules resolve at runtime
    COPY --from=build /root/.local/share/pnpm/store /root/.local/share/pnpm/store
    
    EXPOSE 3001
    # Use the local prisma binary that exists under ./node_modules/.bin
    CMD node -e "console.log('Applying migrations...')" \
     && ./node_modules/.bin/prisma migrate deploy \
     && node dist/main.js
    