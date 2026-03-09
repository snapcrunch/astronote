import path from "node:path";
import type { Knex } from "knex";

export function createKnexConfig(dbPath: string): Knex.Config {
  return {
    client: "better-sqlite3",
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(import.meta.dirname, "migrations"),
    },
    seeds: {
      directory: path.join(import.meta.dirname, "seeds"),
    },
  };
}
