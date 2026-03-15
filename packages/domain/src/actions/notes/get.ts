import type { Note, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function get(user: AuthUser, id: string): Promise<Note | null> {
  return repository.getNoteById(user.id, id);
}
