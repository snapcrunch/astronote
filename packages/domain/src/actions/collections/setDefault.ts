import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function setDefault(user: AuthUser, id: number): Promise<boolean> {
  return repository.collections.setDefault(user.id, id);
}
