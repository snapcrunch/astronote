import type { Collection, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function create(
  user: AuthUser,
  name: string
): Promise<Collection> {
  return repository.createCollection(user.id, name);
}
