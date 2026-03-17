import type { AuthUser } from '@repo/types';
import * as repository from '@repo/repository';
import { populateUser } from '../users/populateUser';

export async function remove(user: AuthUser, id: number): Promise<boolean> {
  const deleted = await repository.deleteCollection(user.id, id);
  if (!deleted) return false;

  const remaining = await repository.getCollections(user.id);
  if (remaining.length === 0) {
    await populateUser(user);
  } else if (remaining.length === 1) {
    await repository.setDefaultCollection(user.id, remaining[0].id);
  }

  return true;
}
