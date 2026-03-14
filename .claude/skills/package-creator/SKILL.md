---
description: When creating a new package or app in this monorepo
user-invocable: false
---

# New Package Creation Requirements

When creating a new package (in `apps/` or `packages/`), it **must** extend our shared ESLint and TypeScript config packages:

## TypeScript Config

The new package's `tsconfig.json` must extend one of the shared configs from `@repo/typescript-config`:

- `@repo/typescript-config/node.json` — for Node.js packages and apps
- `@repo/typescript-config/base.json` — for libraries
- `@repo/typescript-config/react-library.json` — for React libraries
- `@repo/typescript-config/nextjs.json` — for Next.js apps

## ESLint Config

The new package must have an `eslint.config.js` that extends our shared config:

```js
import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [...config];
```

## package.json devDependencies

The new package must include these devDependencies:

```json
{
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "eslint": "^9.39.1",
    "typescript": "^5.9.2"
  }
}
```

## Scripts

The new package must include at minimum these scripts:

```json
{
  "scripts": {
    "check-types": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```
