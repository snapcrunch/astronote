import { getDb } from "../db";

export async function getTags(collectionId?: number): Promise<{ tag: string; count: number }[]> {
  const db = getDb();
  if (collectionId == null) {
    return db("tags").orderBy("count", "desc").orderBy("tag", "asc").select("tag", "count");
  }
  const rows = await db("note_tags")
    .join("notes", "note_tags.noteId", "notes.id")
    .where("notes.archived", 0)
    .andWhere("notes.collectionId", collectionId)
    .select("note_tags.tag as tag")
    .count("* as count")
    .groupBy("note_tags.tag")
    .orderBy("count", "desc")
    .orderBy("tag", "asc");
  return rows.map((r) => ({ tag: String(r.tag), count: Number(r.count) }));
}
