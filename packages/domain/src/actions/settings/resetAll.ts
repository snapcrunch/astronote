import type { Collection, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function resetAll(user: AuthUser): Promise<Collection> {
  return repository.resetAll(user.id);
}
