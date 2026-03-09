import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("collections", (table) => {
    table.integer("isDefault").notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("collections", (table) => {
    table.dropColumn("isDefault");
  });
}
