import type { Collection } from "@repo/types";
import { DEFAULT_SETTINGS } from "@repo/types";
import { getDb } from "../db";

export async function resetAll(): Promise<Collection> {
  const db = getDb();
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
