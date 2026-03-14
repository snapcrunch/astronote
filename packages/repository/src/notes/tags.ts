import { getDb } from "../db";

export async function addNoteTag(noteId: string, tag: string): Promise<void> {
  const db = getDb();
  await db("note_tags").insert({ noteId, tag }).onConflict(["noteId", "tag"]).ignore();
  await db.raw(
    "INSERT INTO tags (tag, count) VALUES (?, 1) ON CONFLICT(tag) DO UPDATE SET count = count + 1",
    [tag],
  );
}

export async function removeNoteTag(noteId: string, tag: string): Promise<void> {
  const db = getDb();
  const exists = await db("note_tags").where({ noteId, tag }).first();
  if (!exists) return;

  await db("note_tags").where({ noteId, tag }).delete();
  await db("tags").where("tag", tag).decrement("count", 1);
  await db("tags").where("count", "<=", 0).delete();
}

export async function incrementTags(tags: string[]): Promise<void> {
  const db = getDb();
  for (const tag of tags) {
    await db.raw(
      "INSERT INTO tags (tag, count) VALUES (?, 1) ON CONFLICT(tag) DO UPDATE SET count = count + 1",
      [tag],
    );
  }
}

export async function decrementTags(tags: string[]): Promise<void> {
  const db = getDb();
  for (const tag of tags) {
    await db("tags").where("tag", tag).decrement("count", 1);
  }
  await db("tags").where("count", "<=", 0).delete();
}
