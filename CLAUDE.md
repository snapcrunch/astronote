# Monorepo Summary

This repository contains a monorepo managed by [Turborepo](https://turborepo.dev/docs). It implements a web-based note-taking application called "Astronote" that is strongly influenced by a MacOS application called [The Archive](https://zettelkasten.de/the-archive/).

## The Frontend Application

The web-based frontend is developed using:

- TypeScript
- React
- [Material UI](https://mui.com/material-ui/getting-started/) (UI components library)
- [Zustand](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) (State management library)

### Layout

A screenshot that shows the desired layout can be found [here](./resources/screenshots/web-app1.png).

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

### Mobile Support

Currently, we are only interested in desktop support. We are not interested in implementing mobile device support.