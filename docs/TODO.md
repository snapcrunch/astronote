# Features to be Implemented

- [x] Add an option to the note context menu that allows the user to add (and remove) tags to the note.
- [x] Add an option to the note context menu that allows the user to mark as note as having been "pinned." Pinned notes are always displayed at the top of the list. When a note is pinned (or unpinned), the notes table in the DB will need to be updated. This will require a migration.
- [x] Add an option to the note context menu that allows the user to rename a note. When selected, a command palette style input field should be displayed. This is where the renaming of the note occurs. Create a keyboard shortcut that triggers this process for the active note: CMD-SHIFT-E
- [x] When viewing a note in rendered mode, implement syntax highlighting for codeblocks.
- [x] When in edit mode, when I press the tab key, rather than tabbing within the document - it moves focused to the sidebar.
- [x] When I tab in a document (during edit mode), it should insert 4 spaces (not a tab character).
- [x] When viewing a note in render mode, if I press the escape key, the selected note should be de-selected.
- [x] Remove the excess padding around the "Add a tag" input field in the right-hand sidebar. It should be flush with the container (similar to the omnibar).
- [x] Disable the "Change Collection" command palette action if only one collection exists.
- [x] Ensure that the web app served by the Docker image is the compiled / bundled one (and not the dev version served by Vite).
- [x] When the user deletes one of their collections, if it is the only collection they have - they are left with no collections. Instead, if they delete their only collection - we should populate their account back with default data like we do upon creation of a new account or when the user selects the "Reset All Data" action.
- [x] The mechanism by which the web app's WebClient should seemlessly and automatically detect an expired JWT token and refresh it (without the user being logged out or noticing it) appears to be broken. Find out why. Explain. Fix it.
- [x] Provide recommendations on things that could be done in the frontend web app to increase polish / make the app appear more professional and well-put-together.
- [x] In the chat window interface that allows the user to interact with Claude Code - messages from Claude that are displayed should be parsed as Markdown.
- [x] In the notes list in the left-hand sidebar, add an action labeled "Copy Note ID" that copies the selected note's ID to the clipboard.
- [x] Alfred workflow. Use alfy.
- [ ] In the right-hand "notes metadata" sidebar, move the "Dates" section to the top and rename it to simply "Note". Add a new item within this section labled "ID". On this row, display the note's ID.
