import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function list(
  user: AuthUser,
  collectionId?: number
): Promise<{ tag: string; count: number }[]> {
  return repository.tags.list({ userId: user.id, collectionId });
}
