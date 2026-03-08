import { useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import type { Note } from "./types";
import seedNotes from "./notes.json";

const initialNotes: Note[] = seedNotes.map((n) => ({
  id: crypto.randomUUID(),
  title: n.title,
  content: n.content,
  createdAt: n.created,
  updatedAt: n.updated,
}));

function createNote(title: string): Note {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

function App() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }, [notes, searchQuery]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const handleCreateNote = useCallback((title: string) => {
    const note = createNote(title);
    setNotes((prev) => [note, ...prev]);
    setSelectedNoteId(note.id);
    setSearchQuery("");
  }, []);

  const handleUpdateNote = useCallback(
    (id: string, updates: Partial<Pick<Note, "title" | "content">>) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
            : n,
        ),
      );
    },
    [],
  );

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Sidebar
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectNote={setSelectedNoteId}
        onCreateNote={handleCreateNote}
      />
      <NoteEditor note={selectedNote} onUpdateNote={handleUpdateNote} />
    </Box>
  );
}

export default App;
