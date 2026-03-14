import type { Collection } from '@repo/types';
import * as repository from '@repo/repository';

export async function resetAll(): Promise<Collection> {
  return repository.resetAll();
}
