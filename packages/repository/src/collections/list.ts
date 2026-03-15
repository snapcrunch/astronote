import type { Collection } from '@repo/types';
import { getDb } from '../db';
import { rowToCollection } from './helpers';

export async function getCollections(userId: number): Promise<Collection[]> {
  const db = getDb();
  const rows = await db('collections')
    .join(
      'users_collections',
      'collections.id',
      'users_collections.collection_id'
    )
    .where('users_collections.user_id', userId)
    .select('collections.*')
    .select(
      db.raw(
        '(SELECT COUNT(*) FROM notes WHERE notes.collectionId = collections.id AND notes.archived = 0) as noteCount'
      )
    )
    .orderBy('collections.name', 'asc');
  return rows.map(rowToCollection);
}
