import knexLib from "knex";
import type { Knex } from "knex";
import { createKnexConfig } from "./knexfile";

let db: Knex;

export async function initDatabase(path: string): Promise<void> {
  db = knexLib(createKnexConfig(path));
  await db.migrate.latest();
}

export async function seedDatabase(): Promise<void> {
  const noteCount = await db("notes").count("* as count").first();
  const collectionCount = await db("collections").count("* as count").first();
  if (Number(noteCount?.count ?? 0) > 0 || Number(collectionCount?.count ?? 0) > 0) return;
  await db.seed.run();
}

export function getDb(): Knex {
  return db;
}
