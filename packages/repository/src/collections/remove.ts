import { getDb } from "../db";

export async function deleteCollection(id: number): Promise<boolean> {
  const db = getDb();
  await db("notes").where("collectionId", id).update({ collectionId: null });
  const deleted = await db("collections").where("id", id).delete();
  return deleted > 0;
}
