import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function remove(user: AuthUser, id: string): Promise<boolean> {
  return repository.notes.archive(user.id, id);
}
