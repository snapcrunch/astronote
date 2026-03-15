import type { Collection, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function list(user: AuthUser): Promise<Collection[]> {
  return repository.getCollections(user.id);
}
