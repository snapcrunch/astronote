import type { Collection } from '@repo/types';
import * as repository from '@repo/repository';

export async function list(): Promise<Collection[]> {
  return repository.getCollections();
}
