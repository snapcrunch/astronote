import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("collections", (table) => {
    table.increments("id").primary();
    table.text("name").notNullable();
  });

  await knex.schema.createTable("notes", (table) => {
    table.text("id").primary();
    table.text("title").notNullable();
    table.text("content").notNullable().defaultTo("");
    table.integer("archived").notNullable().defaultTo(0);
    table.text("createdAt").notNullable();
    table.text("updatedAt").notNullable();
  });

  await knex.schema.createTable("tags", (table) => {
    table.text("tag").primary();
    table.integer("count").notNullable().defaultTo(0);
  });

  await knex.schema.createTable("note_tags", (table) => {
    table.text("noteId").notNullable().references("id").inTable("notes");
    table.text("tag").notNullable();
    table.primary(["noteId", "tag"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("note_tags");
  await knex.schema.dropTableIfExists("tags");
  await knex.schema.dropTableIfExists("notes");
  await knex.schema.dropTableIfExists("collections");
}
