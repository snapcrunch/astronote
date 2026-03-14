import type { Note } from '@repo/types';
import * as repository from '@repo/repository';

export async function get(id: string): Promise<Note | null> {
  return repository.getNoteById(id);
}
