import type { Collection } from "@repo/types";
import { getDb } from "../db";
import { rowToCollection } from "./helpers";

export async function getCollections(): Promise<Collection[]> {
  const db = getDb();
  const rows = await db("collections")
    .select("collections.*")
    .select(db.raw("(SELECT COUNT(*) FROM notes WHERE notes.collectionId = collections.id AND notes.archived = 0) as noteCount"))
    .orderBy("collections.name", "asc");
  return rows.map(rowToCollection);
}
