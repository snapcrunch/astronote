import type { AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function list(
  user: AuthUser,
  collectionId?: number
): Promise<{ tag: string; count: number }[]> {
  return repository.getTags(user.id, collectionId);
}
