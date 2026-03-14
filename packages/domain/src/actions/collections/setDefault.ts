import type { AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function setDefault(user: AuthUser, id: number): Promise<boolean> {
  return repository.setDefaultCollection(user.id, id);
}
