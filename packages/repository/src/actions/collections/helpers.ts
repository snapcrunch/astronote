import type { Collection } from '@repo/types';

export function rowToCollection(row: Record<string, unknown>): Collection {
  return {
    id: row.id as number,
    name: row.name as string,
    isDefault: (row.isDefault as number) === 1,
    noteCount: (row.noteCount as number) ?? 0,
  };
}
