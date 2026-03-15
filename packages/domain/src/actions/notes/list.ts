import type { Note, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function list(
  user: AuthUser,
  query?: string,
  tags?: string[],
  collectionId?: number
): Promise<Note[]> {
  return repository.getNotes(user.id, query, tags, collectionId);
}
