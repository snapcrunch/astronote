import type { AuthUser, Collection } from '@repo/types';
import repository from '@repo/repository';
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

export async function populateUser(user: AuthUser): Promise<Collection> {
  await repository.settings.update({
    userId: user.id,
    updates: DEFAULT_SETTINGS,
  });
  const collection = await repository.collections.create({
    userId: user.id,
    name: 'Default',
  });
  await repository.collections.setDefault({
    userId: user.id,
    id: collection.id,
  });

  for (const note of defaultNotes) {
    await createNote(user, {
      title: note.title,
      content: note.content,
      tags: note.tags,
      pinned: note.pinned,
      collectionId: collection.id,
    });
  }

  return collection;
}
