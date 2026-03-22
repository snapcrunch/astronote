import type { Attachment, Note } from '@repo/types';

export function trimNoteContent(note: Note): Note {
  return { ...note, content: note.content.trim() };
}

export function buildFrontmatter(
  note: Note,
  collectionName?: string,
  attachments?: Attachment[]
): string {
  const lines = [
    '---',
    `id: ${note.id}`,
    `title: ${note.title}`,
    `tags: ${note.tags.join(', ')}`,
    ...(collectionName ? [`collection: ${collectionName}`] : []),
    `pinned: ${note.pinned ? 'true' : 'false'}`,
    `createdAt: ${note.createdAt}`,
    `updatedAt: ${note.updatedAt}`,
  ];
  if (attachments && attachments.length > 0) {
    lines.push('attachments:');
    for (const att of attachments) {
      lines.push(`  - id: ${att.id}`);
      lines.push(`    filename: ${att.filename}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}
