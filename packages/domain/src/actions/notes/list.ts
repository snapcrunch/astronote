import type { Note, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function list(
  user: AuthUser,
  params?: { query?: string; tags?: string[]; collectionId?: number }
): Promise<Note[]> {
  return repository.notes.list({
    userId: user.id,
    query: params?.query,
    tags: params?.tags,
    collectionId: params?.collectionId,
  });
}
