import type { Note, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function get(user: AuthUser, id: string): Promise<Note | null> {
  return repository.notes.getById({ userId: user.id, id });
}
