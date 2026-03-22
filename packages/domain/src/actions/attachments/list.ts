import type { Attachment, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function list(
  user: AuthUser,
  noteId: number
): Promise<Attachment[]> {
  return repository.attachments.listByNoteId({ userId: user.id, noteId });
}
