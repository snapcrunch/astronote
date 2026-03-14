import { getDb } from "../db";

export async function setDefaultCollection(id: number): Promise<boolean> {
  const db = getDb();
  const exists = await db("collections").where("id", id).first();
  if (!exists) return false;
  await db("collections").update({ isDefault: 0 });
  await db("collections").where("id", id).update({ isDefault: 1 });
  return true;
}
