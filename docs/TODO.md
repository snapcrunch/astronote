# Features to be Implemented

- [x] Add an option to the note context menu that allows the user to add (and remove) tags to the note.
- [x] Add an option to the note context menu that allows the user to mark as note as having been "pinned." Pinned notes are always displayed at the top of the list. When a note is pinned (or unpinned), the notes table in the DB will need to be updated. This will require a migration.
- [x] Add an option to the note context menu that allows the user to rename a note. When selected, a command palette style input field should be displayed. This is where the renaming of the note occurs. Create a keyboard shortcut that triggers this process for the active note: CMD-SHIFT-E
- [ ] When viewing a note in rendered mode, implement syntax highlighting for codeblocks.