import type { AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function remove(user: AuthUser, id: number): Promise<boolean> {
  return repository.deleteCollection(user.id, id);
}
