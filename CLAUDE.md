# Monorepo Summary

This repo contains a web-based note-taking application called "Astronote." It is structured as a monorepo managed by [Turborepo](https://turborepo.dev/docs). Package dependencies are managed by [Yarn](https://yarnpkg.com/).

## Packages

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

#### The Info Panel

On the right-hand side of the content view there is a collapsible "info panel" that displays metadata about the currently selected note, including:

- Note attributes (ID, created/modified dates)
- Table of contents (generated from headings)
- Tags (with ability to add/remove)
- Statistics (word count, character count, etc.)
- Related notes (notes sharing tags or linked via wiki-links)

#### The Knowledge Graph Footer

At the bottom of the screen there is a collapsible "Knowledge Graph" footer panel. When expanded, it displays an interactive graph visualization ([Cytoscape.js](https://js.cytoscape.org/) with the [fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) layout algorithm) showing relationships between notes. Notes are connected by:

- **Wiki-links** (`[[noteId]]` syntax in note content) — shown as solid directed edges
- **Shared tags** — shown as dashed undirected edges

Features:

- The panel height is adjustable by dragging the top border
- Clicking a node selects the corresponding note in the sidebar/editor
- The graph pans smoothly to center the selected note
- The graph respects the active collection and selected tag filters
- The open/closed state is persisted in the URL via a `?graph=1` query parameter
- Graph data is computed server-side via `GET /api/notes/graph` for efficiency

#### The Command Palette

The command palette is accessible via `CMD-SHIFT-P` or by clicking the planet icon in the omnibar. It provides quick access to actions like managing collections, importing/exporting notes, and changing settings.

### Note Relationships

Notes can be related to other notes by virtue of the fact that they:

- Have common tags
- Link to one another via `[[wiki-style]]` links (where the number inside the brackets is the target note's ID)
- Exist in the same collection
