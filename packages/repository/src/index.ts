import path from "node:path";
import type { Knex } from "knex";
import type { Note, Collection, Settings } from "@repo/types";
import { DEFAULT_SETTINGS } from "@repo/types";

let db: Knex;

export const migrationsDirectory = path.join(import.meta.dirname, "migrations");
export const seedsDirectory = path.join(import.meta.dirname, "seeds");

export async function init(knex: Knex): Promise<void> {
  db = knex;
  await db.migrate.latest({
    directory: migrationsDirectory,
  });
}

export async function seedDatabase(): Promise<void> {
  const noteCount = await db("notes").count("* as count").first();
  const collectionCount = await db("collections").count("* as count").first();
  if (Number(noteCount?.count ?? 0) > 0 || Number(collectionCount?.count ?? 0) > 0) return;
  await db.seed.run({ directory: seedsDirectory });
}

function getNoteTags(noteId: string): string[] {
  const rows = db("note_tags")
    .where("noteId", noteId)
    .orderBy("tag", "asc")
    .select("tag") as unknown as { tag: string }[];
  return rows.map((r) => r.tag);
}

async function getNoteTagsAsync(noteId: string): Promise<string[]> {
  const rows = await db("note_tags")
    .where("noteId", noteId)
    .orderBy("tag", "asc")
    .select("tag");
  return rows.map((r) => r.tag);
}

async function rowToNote(row: Record<string, unknown>): Promise<Note> {
  const id = row.id as string;
  return {
    id,
    title: row.title as string,
    content: row.content as string,
    tags: await getNoteTagsAsync(id),
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
    pinned: Boolean(row.pinned),
  };
}

export async function getNotes(query?: string, tags?: string[], collectionId?: number): Promise<Note[]> {
  let q = db("notes").where("archived", 0);

  if (collectionId != null) {
    q = q.andWhere("collectionId", collectionId);
  }

  if (query) {
    const pattern = `%${query}%`;
    q = q.andWhere(function () {
      this.where("title", "like", pattern).orWhere("content", "like", pattern);
    });
  }

  if (tags && tags.length > 0) {
    for (const tag of tags) {
      q = q.andWhere("id", "in", db("note_tags").where("tag", tag).select("noteId"));
    }
  }

  const rows = await q.orderBy([{ column: "pinned", order: "desc" }, { column: "updatedAt", order: "desc" }]);
  return Promise.all(rows.map(rowToNote));
}

export async function getNoteById(id: string): Promise<Note | null> {
  const row = await db("notes").where("id", id).first();
  if (!row) return null;
  return rowToNote(row);
}

export async function createNote(note: Note, collectionId?: number): Promise<Note> {
  await db("notes").insert({
    id: note.id,
    title: note.title,
    content: note.content,
    collectionId: collectionId ?? null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  });
  for (const tag of note.tags) {
    await db("note_tags").insert({ noteId: note.id, tag }).onConflict(["noteId", "tag"]).ignore();
  }
  return { ...note, tags: await getNoteTagsAsync(note.id) };
}

export async function updateNote(
  id: string,
  updates: { title?: string; content?: string; pinned?: boolean; updatedAt: string },
): Promise<Note | null> {
  const existing = await getNoteById(id);
  if (!existing) return null;

  const title = updates.title ?? existing.title;
  const content = updates.content ?? existing.content;
  const pinned = updates.pinned !== undefined ? updates.pinned : existing.pinned;

  await db("notes").where("id", id).update({
    title,
    content,
    pinned,
    updatedAt: updates.updatedAt,
  });

  return { ...existing, title, content, pinned, updatedAt: updates.updatedAt };
}

export async function addNoteTag(noteId: string, tag: string): Promise<void> {
  await db("note_tags").insert({ noteId, tag }).onConflict(["noteId", "tag"]).ignore();
  await db.raw(
    "INSERT INTO tags (tag, count) VALUES (?, 1) ON CONFLICT(tag) DO UPDATE SET count = count + 1",
    [tag],
  );
}

export async function removeNoteTag(noteId: string, tag: string): Promise<void> {
  const exists = await db("note_tags").where({ noteId, tag }).first();
  if (!exists) return;

  await db("note_tags").where({ noteId, tag }).delete();
  await db("tags").where("tag", tag).decrement("count", 1);
  await db("tags").where("count", "<=", 0).delete();
}

export async function deleteNote(id: string): Promise<boolean> {
  const existing = await getNoteById(id);
  if (!existing) return false;
  await db("note_tags").where("noteId", id).delete();
  await db("notes").where("id", id).delete();
  return true;
}

export async function archiveNote(id: string): Promise<boolean> {
  const existing = await getNoteById(id);
  if (!existing) return false;

  for (const tag of existing.tags) {
    await db("tags").where("tag", tag).decrement("count", 1);
  }
  await db("tags").where("count", "<=", 0).delete();

  await db("note_tags").where("noteId", id).delete();
  await db("notes").where("id", id).update({
    archived: 1,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

export async function incrementTags(tags: string[]): Promise<void> {
  for (const tag of tags) {
    await db.raw(
      "INSERT INTO tags (tag, count) VALUES (?, 1) ON CONFLICT(tag) DO UPDATE SET count = count + 1",
      [tag],
    );
  }
}

export async function decrementTags(tags: string[]): Promise<void> {
  for (const tag of tags) {
    await db("tags").where("tag", tag).decrement("count", 1);
  }
  await db("tags").where("count", "<=", 0).delete();
}

export async function getTags(): Promise<{ tag: string; count: number }[]> {
  return db("tags").orderBy("count", "desc").orderBy("tag", "asc").select("tag", "count");
}

export async function getNoteCount(): Promise<number> {
  const result = await db("notes").where("archived", 0).count("* as count").first();
  return Number(result?.count ?? 0);
}

// Collections

function rowToCollection(row: Record<string, unknown>): Collection {
  return {
    id: row.id as number,
    name: row.name as string,
    isDefault: (row.isDefault as number) === 1,
    noteCount: (row.noteCount as number) ?? 0,
  };
}

export async function getCollections(): Promise<Collection[]> {
  const rows = await db("collections")
    .select("collections.*")
    .select(db.raw("(SELECT COUNT(*) FROM notes WHERE notes.collectionId = collections.id AND notes.archived = 0) as noteCount"))
    .orderBy("collections.name", "asc");
  return rows.map(rowToCollection);
}

export async function createCollection(name: string): Promise<Collection> {
  const [id] = await db("collections").insert({ name });
  return { id: id!, name, isDefault: false, noteCount: 0 };
}

export async function deleteCollection(id: number): Promise<boolean> {
  await db("notes").where("collectionId", id).update({ collectionId: null });
  const deleted = await db("collections").where("id", id).delete();
  return deleted > 0;
}

export async function setDefaultCollection(id: number): Promise<boolean> {
  const exists = await db("collections").where("id", id).first();
  if (!exists) return false;
  await db("collections").update({ isDefault: 0 });
  await db("collections").where("id", id).update({ isDefault: 1 });
  return true;
}

// Settings

export async function getSettings(): Promise<Settings> {
  const row = await db("settings").where("key", "settings").first();
  if (!row) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value as string) };
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const merged = { ...current, ...updates };
  const value = JSON.stringify(merged);
  await db("settings").where("key", "settings").update({ value });
  return merged;
}

export async function resetAll(): Promise<Collection> {
  await db("note_tags").delete();
  await db("tags").delete();
  await db("notes").delete();
  await db("collections").delete();
  await db("settings")
    .where("key", "settings")
    .update({ value: JSON.stringify(DEFAULT_SETTINGS) });
  const [id] = await db("collections").insert({ name: "Default", isDefault: 1 });
  return { id: id!, name: "Default", isDefault: true, noteCount: 0 };
}
