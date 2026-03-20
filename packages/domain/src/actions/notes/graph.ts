import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function graph(
  user: AuthUser,
  params?: {
    collectionId?: number;
    tags?: string[];
  }
) {
  return repository.notes.getGraph({
    userId: user.id,
    collectionId: params?.collectionId,
    tags: params?.tags,
  });
}
