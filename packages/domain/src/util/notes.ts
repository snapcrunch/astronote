import type { Note } from '@repo/types';

export function trimNoteContent(note: Note): Note {
  return { ...note, content: note.content.trim() };
}

export function buildFrontmatter(note: Note, collectionName?: string): string {
  return [
    '---',
    `id: ${note.id}`,
    `title: ${note.title}`,
    `tags: ${note.tags.join(', ')}`,
    ...(collectionName ? [`collection: ${collectionName}`] : []),
    `pinned: ${note.pinned ? 'true' : 'false'}`,
    `createdAt: ${note.createdAt}`,
    `updatedAt: ${note.updatedAt}`,
    '---',
  ].join('\n');
}
