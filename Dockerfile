# Stage 1: Build
FROM node:24-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json apps/api/
COPY apps/cli/package.json apps/cli/
COPY apps/web-app/package.json apps/web-app/
COPY packages/types/package.json packages/types/
COPY packages/domain/package.json packages/domain/
COPY packages/repository/package.json packages/repository/
COPY packages/astronote-client/package.json packages/astronote-client/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/

RUN yarn install --immutable

COPY . .

RUN yarn build

# Stage 2: Production
FROM node:24-slim

RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy node_modules from builder (avoids a second yarn install)
COPY --from=builder /app/node_modules node_modules

# Copy runtime source (API runs TypeScript via tsx)
COPY apps/api/package.json apps/api/
COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/

# Copy workspace packages needed at runtime
COPY packages/types/package.json packages/types/
COPY packages/types/src packages/types/src
COPY packages/domain/package.json packages/domain/
COPY packages/domain/src packages/domain/src
COPY packages/repository/package.json packages/repository/
COPY packages/repository/src packages/repository/src

# Copy CLI app
COPY apps/cli/package.json apps/cli/
COPY apps/cli/src apps/cli/src
COPY apps/cli/tsconfig.json apps/cli/

# Copy pre-built web-app from builder
COPY --from=builder /app/apps/web-app/dist apps/web-app/dist

EXPOSE 3009

ENTRYPOINT ["tini", "--"]
CMD ["node_modules/.bin/tsx", "apps/api/src/index.ts"]