import type { Collection } from "@repo/types";
import { getDb } from "../db";

export async function createCollection(name: string): Promise<Collection> {
  const db = getDb();
  const [id] = await db("collections").insert({ name });
  return { id: id!, name, isDefault: false, noteCount: 0 };
}
