import type { AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function remove(user: AuthUser, id: string): Promise<boolean> {
  return repository.archiveNote(user.id, id);
}
