import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { removeAllByNoteId } from '../attachments/remove';

export async function remove(
  user: AuthUser,
  id: number,
  dataDir?: string
): Promise<boolean> {
  if (dataDir) {
    await removeAllByNoteId(user, id, dataDir);
  }
  return repository.notes.archive({ userId: user.id, id });
}
