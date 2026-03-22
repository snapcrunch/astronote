import path from 'node:path';
import fs from 'node:fs';
import archiver from 'archiver';
import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { buildFrontmatter } from '../../util/notes';

/**
 * Exports all notes as a zip archive of markdown files.
 * Attachment files are included in an `attachments/` folder within the zip.
 *
 * Returns a readable stream that must be piped to the destination (e.g. an HTTP response).
 * The caller is responsible for calling `archive.finalize()` after piping.
 */
export async function exportAll(user: AuthUser, dataDir?: string) {
  const entries = await repository.notes.listForExport(user.id);

  const archive = archiver('zip', { zlib: { level: 9 } });

  for (const { note, collectionName } of entries) {
    const attachments = await repository.attachments.listByNoteId({
      userId: user.id,
      noteId: note.id,
    });

    const frontmatter = buildFrontmatter(
      note,
      collectionName ?? undefined,
      attachments.length > 0 ? attachments : undefined
    );
    const body = `${frontmatter}\n\n${note.content}`;
    const safeName = note.title.replace(/[/\\:*?"<>|]/g, '_');
    archive.append(body, { name: `${safeName}.md` });

    if (dataDir && attachments.length > 0) {
      for (const att of attachments) {
        const row = await repository.attachments.getById({
          userId: user.id,
          id: att.id,
        });
        if (!row) continue;
        const filePath = path.join(dataDir, row.storagePath);
        if (fs.existsSync(filePath)) {
          const ext = path.extname(att.filename) || '';
          archive.file(filePath, { name: `attachments/${att.id}${ext}` });
        }
      }
    }
  }

  return archive;
}
