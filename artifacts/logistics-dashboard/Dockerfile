# ── Frontend — multi-stage build ──────────────────────────────────────────────

# Stage 1: Build  (node:24-slim = Debian/glibc, matches pnpm-lock.yaml platform)
FROM node:24-slim AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace root config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all workspace packages needed
COPY lib/api-client-react/ ./lib/api-client-react/
COPY lib/api-zod/          ./lib/api-zod/
COPY lib/api-spec/         ./lib/api-spec/
COPY lib/db/               ./lib/db/
COPY scripts/              ./scripts/
COPY artifacts/logistics-dashboard/ ./artifacts/logistics-dashboard/

# Install all dependencies (including devDeps needed for build)
# NOTE: --no-frozen-lockfile allows the image build to proceed even if
# the lockfile is slightly out of sync with package.json in this workspace.
RUN pnpm install --no-frozen-lockfile

# Run Vite build from within the package directory
WORKDIR /app/artifacts/logistics-dashboard
ENV NODE_ENV=production
RUN pnpm exec vite build --config vite.docker.config.ts

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/artifacts/logistics-dashboard/dist/public /usr/share/nginx/html

EXPOSE 80
