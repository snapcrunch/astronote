import type { Note } from '@repo/types';
import * as repository from '@repo/repository';

export async function list(
  query?: string,
  tags?: string[],
  collectionId?: number
): Promise<Note[]> {
  return repository.getNotes(query, tags, collectionId);
}
