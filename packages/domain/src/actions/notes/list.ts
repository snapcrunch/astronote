import type { Note, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function list(
  user: AuthUser,
  query?: string,
  tags?: string[],
  collectionId?: number
): Promise<Note[]> {
  return repository.notes.list(user.id, query, tags, collectionId);
}
