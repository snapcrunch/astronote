import type { Note } from '@repo/types';

export function buildFrontmatter(note: Note, collectionName?: string): string {
  return [
    '---',
    `title: ${note.title}`,
    `tags: ${note.tags.join(', ')}`,
    ...(collectionName ? [`collection: ${collectionName}`] : []),
    `pinned: ${note.pinned ? 'true' : 'false'}`,
    '---',
  ].join('\n');
}
