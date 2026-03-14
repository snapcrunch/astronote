import archiver from 'archiver';
import * as repository from '@repo/repository';
import { buildFrontmatter } from '../../util/notes';

/**
 * Exports all notes as a zip archive of markdown files.
 *
 * Returns a readable stream that must be piped to the destination (e.g. an HTTP response).
 * The caller is responsible for calling `archive.finalize()` after piping.
 */
export async function exportAll() {
  const entries = await repository.getNotesForExport();

  const archive = archiver('zip', { zlib: { level: 9 } });

  for (const { note, collectionName } of entries) {
    const frontmatter = buildFrontmatter(note, collectionName ?? undefined);
    const body = `${frontmatter}\n\n${note.content}`;
    const safeName = note.title.replace(/[/\\:*?"<>|]/g, '_');
    archive.append(body, { name: `${safeName}.md` });
  }

  return archive;
}
