# Astronote

Yet another note taking application[^1].

![Astronote](./screenshot.jpg)

## Features

- **Full-text search & instant creation** — Type in the omnibar to search existing notes or press Enter to create a new one.
- **Markdown editing** — Write notes in Markdown with a live rendered preview, powered by CodeMirror. Syntax highlighting for code blocks, `[[wiki-style links]]` between notes with autocomplete and broken-link detection, and clickable task list checkboxes.
- **Note actions** — Rename (⌘⇧E), delete (⌘⇧D), pin, move to a collection, manage tags, or copy a note's ID — all available from the right-click context menu.
- **Collections** — Organize notes into collections and quickly switch between them.
- **Tags** — Tag notes for flexible categorization and filter by tags in the sidebar.
- **Info panel** — Toggle a side panel (⌘I) showing a table of contents, word and character statistics, creation and modification dates, and related notes.
- **Pinned notes** — Pin important notes to the top of the list.
- **Command palette** — Access all actions quickly via the command palette (⌘⇧P), including data reset.
- **Import & export** — Import notes from ZIP archives and export all notes for backup.
- **API keys** — Generate keys for programmatic access to the REST API. Create, view, and revoke keys from Settings.
- **Git backups** — Automatically back up notes to a remote Git repository on an hourly or daily schedule. Configure an SSH URL and private key in Settings, or trigger a backup manually at any time.
- **Knowledge graph** — An interactive graph visualization at the bottom of the screen shows relationships between notes. Notes are connected by wiki-links (solid edges) and shared tags (dashed edges). Click any node to jump to that note. The panel is resizable by dragging the top border and its state persists in the URL.
- **Color themes** — Choose from seven built-in themes: Default, Dark, Solarized Light, Solarized Dark, Nord, Dracula, and Geek (Light). Configure in Settings (⌘⇧S).
- **Interactive onboarding** — A guided tutorial walks new users through core features on first visit.
- **Settings** — Configure the default editor view, info panel visibility, and color theme (⌘⇧S).
- **Mobile-friendly** — Responsive layout with touch-optimized interactions and home screen app support (iOS/Android).
- **Alfred workflow** — Search and create notes directly from [Alfred](https://www.alfredapp.com/) using the `an` keyword. See [apps/alfred-workflow](apps/alfred-workflow).
- **Self-hosted** — Runs as a single Docker container with an embedded SQLite database. Optional HTTP basic auth.
- **Ask Claude** — Chat with Claude directly from the app (⌘⇧Z). Claude can search, read, create, and edit your notes, manage tags and collections, and even browse the web — all through a streaming chat interface with session persistence. Authenticate via OAuth from the command palette.

### Keyboard Shortcuts

| Shortcut | Action                 |
| -------- | ---------------------- |
| ⌘⇧K      | Focus search / omnibar |
| ⌘⇧P      | Command palette        |
| ⌘⇧C      | Switch collection      |
| ⌘⇧S      | Open settings          |
| ⌘⇧E      | Rename note            |
| ⌘⇧D      | Delete note            |
| ⌘⇧Z      | Ask Claude             |
| ⌘I       | Toggle info panel      |
| Escape   | Close panel / dialog   |

## Quick Start

```sh
docker run \
  -p 8080:3009 \
  --env ASTRONOTE_DEFAULT_USER="herp.derpson@flurp.com" \
  --env ASTRONOTE_DEFAULT_PASSWORD="changeme" \
  --env ASTRONOTE_JWT_SECRET="random-string" \
  --volume ./astronote-data:/app/data \
  tkambler/astronote:latest
```

## Running in Development Mode

```sh
# Install dependencies, launch the API / frontend in dev mode.
yarn
yarn dev
```

## CLI

The CLI (`yarn cli`) provides commands for administrative and programmatic access to your data.

```sh
# User management
yarn cli create-user --email <email> --password <password>

# Seed the database with sample data
yarn cli seed

# Notes
yarn cli notes list [--query <q>] [--tags <csv>] [--collection-id <id>]
yarn cli notes get --id <id>
yarn cli notes create --title <title> [--content <content>] [--tags <csv>]
yarn cli notes update --id <id> [--title <title>] [--content <content>]
yarn cli notes delete --id <id>
yarn cli notes add-tag --id <noteId> --tag <tag>
yarn cli notes remove-tag --id <noteId> --tag <tag>

# Tags & collections
yarn cli tags list
yarn cli collections list
yarn cli collections create --name <name>
yarn cli collections delete --id <id>

# Settings
yarn cli settings get
yarn cli settings update --key <key> --value <value>
```

Global options: `--user-id <id>` (target a specific user), `--db <path>` (custom database path).

When running in Docker, prefix commands with:

```sh
docker exec <container> node_modules/.bin/tsx apps/cli/src/index.ts <command>
```

## Git Backups

Astronote can automatically back up your notes to a remote Git repository. Each backup exports all notes as a `notes.zip` archive, commits it to the repo, and force-pushes.

### Setup

1. Open **Settings** in the web app.
2. Under **Backups**, set **Backup Mechanism** to **Git**.
3. Enter your **Repository SSH URL** (e.g. `git@github.com:user/astronote-backup.git`).
4. Paste your **Private SSH Key** (the key must have push access to the repository).
5. Choose a **Backup Interval** — **Daily** (default) or **Hourly**.

Backups run automatically on schedule. You can also click **Perform Backup Now** to trigger one immediately.

### How it works

- On service startup, a background monitor is scheduled to run at the top of every hour.
- It checks each user's backup settings and history to determine whether a backup is due.
- The backup clones the repo (shallow, depth 1), writes `notes.zip`, commits, and force-pushes.
- Backup history is recorded in the database so intervals are respected across restarts.

## Packages

This project is structured as a [monorepo](https://monorepo.tools/) managed with [Turborepo](https://turborepo.dev/). It contains several packages:

### Applications

- [apps/web-app](apps/web-app) - React-based UI.
- [apps/api](apps/api) - REST API. This layer is intentionally minimal. It validates requests and forwards them to the `domain` package (see below).
- [apps/cli](apps/cli) - Command-line interface for administrative tasks (user creation, seeding, etc.).
- [apps/alfred-workflow](apps/alfred-workflow) - Alfred workflow for searching and creating notes.

### Libraries

- [packages/astronote-client](packages/astronote-client) - REST API client.
- [packages/domain](packages/domain) - Business logic lives here.
- [packages/repository](packages/repository) - Database code lives here.
- [packages/types](packages/types) - Exports shared [Zod](https://zod.dev/) validation functions and inferred TypeScript types.
- [packages/logger](packages/logger) - Shared logging utility.
- [packages/eslint-config](packages/eslint-config) - Shared [ESLint](https://eslint.org/) config.
- [packages/typescript-config](packages/typescript-config/) - Shared [TypeScript](https://www.typescriptlang.org/) config.

[^1]: This one's the best, though.
