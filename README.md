# Astronote

Yet another note taking application[^1].

![Astronote](./screenshot.jpg)

## Quick Start

```sh
# If you want to build the Docker image yourself, just run: `make`
docker run -p 8080:3009 tkambler/astronote:latest
```

If you prefer to use `docker-compose.yaml`:

```yaml
services:
  astronote:
    image: tkambler/astronote:latest
    ports:
      - "3009:3009"
```

To enable HTTP basic auth, run the following to generate a username / password string:

```sh
docker run --rm -it httpd:2.4 htpasswd -nbB myusername mypassword
```

Then update the config below with the output:

```yaml
services:
  astronote:
    image: tkambler/astronote:latest
    ports:
      - "3009:3009"
    environment:
      ASTRONOTE_AUTH_METHOD: BASIC_AUTH
      ASTRONOTE_AUTH_CREDENTIALS: "username:creds_go_here"
```

**NOTE:** Don't forget that any `$` characters in the encoded password string must be escaped (replaced `$` with `$$`).

## Running in Development Mode

```sh
# Install dependencies, launch the API / frontend in dev mode.
yarn
yarn dev
```

## Packages

This project is structured as a [monorepo](https://monorepo.tools/) managed with [Turborepo](https://turborepo.dev/). It contains several packages:

### Applications

- [apps/web-app](apps/web-app) - React-based UI.
- [apps/api](apps/api) - REST API. This layer is intentionally minimal. It validates requests and forwards them to the `domain` package (see below).

### Libraries

- [packages/astronote-client](packages/astronote-client) - REST API client.
- [packages/domain](packages/domain) - Business logic lives here.
- [packages/repository](packages/repository) - Database code lives here.
- [packages/types](packages/types) - Exports shared [Zod](https://zod.dev/) validation functions and inferred TypeScript types.
- [packages/eslint-config](packages/eslint-config) - Shared [ESLint](https://eslint.org/) config.
- [packages/typescript-config](packages/typescript-config/) - Shared [TypeScript](https://www.typescriptlang.org/) config.

[^1]: This one's the best, though.