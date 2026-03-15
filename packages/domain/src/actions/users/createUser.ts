import bcrypt from 'bcryptjs';
import {
  createUser as repoCreateUser,
  getUserByEmail,
  updateSettings,
  createCollection,
  setDefaultCollection,
} from '@repo/repository';
import { DEFAULT_SETTINGS } from '@repo/types';
import { create as createNote } from '../notes/create';

const defaultNotes = [
  {
    title: 'Getting Started with Astronote',
    tags: ['astronote', 'notes'],
    pinned: true,
    content: `
## Keyboard Shortcuts

- CMD-SHIFT-K - Focus the omnibar.
- CMD-SHIFT-P - Open the command palette.
    `.trim(),
  },
];

export async function createUser(
  email: string,
  password: string
): Promise<{ id: number }> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new UserAlreadyExistsError(email);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await repoCreateUser(email, hashedPassword, salt);

  await updateSettings(user.id, DEFAULT_SETTINGS);
  const collection = await createCollection(user.id, 'Default');
  await setDefaultCollection(user.id, collection.id);

  const authUser = { id: user.id, email };
  for (const note of defaultNotes) {
    await createNote(authUser, {
      title: note.title,
      content: note.content,
      tags: note.tags,
      pinned: note.pinned,
      collectionId: collection.id,
    });
  }

  return user;
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}
