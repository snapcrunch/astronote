import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { populateUser } from '../users/populateUser';

export async function remove(user: AuthUser, id: number): Promise<boolean> {
  const deleted = await repository.collections.remove(user.id, id);
  if (!deleted) return false;

  const remaining = await repository.collections.list(user.id);
  if (remaining.length === 0) {
    await populateUser(user);
  } else if (remaining.length === 1) {
    await repository.collections.setDefault(user.id, remaining[0].id);
  }

  return true;
}
