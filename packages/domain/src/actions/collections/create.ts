import type { Collection, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function create(
  user: AuthUser,
  name: string
): Promise<Collection> {
  const existing = await repository.getUserCollectionByName(user.id, name);
  if (existing) {
    throw new CollectionAlreadyExistsError(name);
  }
  return repository.createCollection(user.id, name);
}

export class CollectionAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`A collection named "${name}" already exists`);
    this.name = 'CollectionAlreadyExistsError';
  }
}
