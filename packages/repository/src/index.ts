import knexLib from "knex";
import type { Knex } from "knex";
import type { Note, Collection } from "@repo/types";
import { createKnexConfig } from "./knexfile";

let db: Knex;

export async function initDatabase(path: string): Promise<void> {
  db = knexLib(createKnexConfig(path));
  await db.migrate.latest();
}

export async function seedDatabase(): Promise<void> {
  await db.seed.run();
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

  const rows = await q.orderBy("updatedAt", "desc");
  return Promise.all(rows.map(rowToNote));
}

export async function getNoteById(id: string): Promise<Note | null> {
  const row = await db("notes").where("id", id).first();
  if (!row) return null;
  return rowToNote(row);
}

export async function createNote(note: Note): Promise<Note> {
  await db("notes").insert({
    id: note.id,
    title: note.title,
    content: note.content,
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
  updates: { title?: string; content?: string; updatedAt: string },
): Promise<Note | null> {
  const existing = await getNoteById(id);
  if (!existing) return null;

  const title = updates.title ?? existing.title;
  const content = updates.content ?? existing.content;

  await db("notes").where("id", id).update({
    title,
    content,
    updatedAt: updates.updatedAt,
  });

  return { ...existing, title, content, updatedAt: updates.updatedAt };
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
  };
}

export async function getCollections(): Promise<Collection[]> {
  const rows = await db("collections").orderBy("name", "asc");
  return rows.map(rowToCollection);
}

export async function createCollection(name: string): Promise<Collection> {
  const [id] = await db("collections").insert({ name });
  return { id, name, isDefault: false };
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
