import type { Collection, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function list(user: AuthUser): Promise<Collection[]> {
  return repository.collections.list(user.id);
}
