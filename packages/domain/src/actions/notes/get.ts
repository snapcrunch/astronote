import type { Note, AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { trimNoteContent } from '../../util/notes';

export async function get(user: AuthUser, id: number): Promise<Note | null> {
  const note = await repository.notes.getById({ userId: user.id, id });
  return note ? trimNoteContent(note) : null;
}
