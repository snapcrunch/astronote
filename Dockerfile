FROM node:24-slim

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json apps/api/
COPY apps/web-app/package.json apps/web-app/
COPY packages/types/package.json packages/types/
COPY packages/domain/package.json packages/domain/
COPY packages/repository/package.json packages/repository/
COPY packages/astronote-client/package.json packages/astronote-client/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/

RUN yarn install --immutable

COPY . .

EXPOSE 3009

CMD ["yarn", "start"]
