import type { Note, AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { trimNoteContent } from '../../util/notes';

export async function list(
  user: AuthUser,
  params?: { query?: string; tags?: string[]; collectionId?: number }
): Promise<Note[]> {
  const notes = await repository.notes.list({
    userId: user.id,
    query: params?.query,
    tags: params?.tags,
    collectionId: params?.collectionId,
  });
  return notes.map(trimNoteContent);
}
