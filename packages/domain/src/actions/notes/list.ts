import type { Note, NoteSummary, AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { trimNoteContent } from '../../util/notes';

export async function list(
  user: AuthUser,
  params?: {
    query?: string;
    tags?: string[];
    collectionId?: number;
    includeContent?: boolean;
  }
): Promise<(Note | NoteSummary)[]> {
  const notes = await repository.notes.list({
    userId: user.id,
    query: params?.query,
    tags: params?.tags,
    collectionId: params?.collectionId,
    includeContent: params?.includeContent,
  });
  if (params?.includeContent) {
    return (notes as Note[]).map(trimNoteContent);
  }
  return notes;
}
