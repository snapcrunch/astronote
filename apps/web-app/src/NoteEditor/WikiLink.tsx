import { useNoteStore } from '../store';

interface WikiLinkProps {
  noteId?: string;
}

function WikiLink({ noteId }: WikiLinkProps) {
  const notes = useNoteStore((s) => s.notes);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);

  if (!noteId) return null;

  const note = notes.find((n) => n.id === Number(noteId));

  if (!note) {
    return (
      <span
        style={{
          textDecoration: 'line-through',
          color: 'gray',
          cursor: 'default',
        }}
      >
        [[{noteId}]]
      </span>
    );
  }

  return (
    <span
      onClick={() => setSelectedNoteId(note.id)}
      style={{
        color: 'inherit',
        textDecoration: 'underline',
        cursor: 'pointer',
      }}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setSelectedNoteId(note.id);
      }}
    >
      {note.title}
    </span>
  );
}

export default WikiLink;
