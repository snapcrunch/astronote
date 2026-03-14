# Monorepo Summary

This repository contains a monorepo managed by [Turborepo](https://turborepo.dev/docs). It implements a web-based note-taking application called "Astronote."

## Packages

This project is structured as a [monorepo](https://monorepo.tools/) managed with [Turborepo](https://turborepo.dev/). It contains several packages:

### Applications

- [apps/web-app](apps/web-app) - React-based UI.
- [apps/api](apps/api) - REST API. This layer is intentionally minimal. It validates requests and forwards them to the `domain` package (see below).

### Libraries

- [packages/astronote-client](packages/astronote-client) - REST API client. Do not put business logic here. It should be a thin wrapper around the `repository` and `domain` packages.
- [packages/domain](packages/domain) - Business logic lives here.
- [packages/repository](packages/repository) - Database code lives here. The only package that should ever import this is the `domain` package.
- [packages/types](packages/types) - Exports shared [Zod](https://zod.dev/) validation functions and inferred TypeScript types. Most (if not all) of our types should live here.
- [packages/eslint-config](packages/eslint-config) - Shared [ESLint](https://eslint.org/) config.
- [packages/typescript-config](packages/typescript-config/) - Shared [TypeScript](https://www.typescriptlang.org/) config.

## The Frontend Application

The web-based frontend is developed using:

- TypeScript
- React
- [Material UI](https://mui.com/material-ui/getting-started/) (UI components library)
- [Zustand](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) (State management library)

### Layout

#### The Sidebar

There is a sidebar on the left-hand side of the screen. At the top of the sidebar, there is an "omnibar" input field that allows the user to:

- Search for existing notes
- Create new notes

Below the omnnibar, matching notes are found.

#### The Content View

The remaining area of the screen (to the right of the sidebar) is the "content view." This portion of the screen is where the user:

- Views the content of a selected note.
- Creates new notes
- Edits existing notes
