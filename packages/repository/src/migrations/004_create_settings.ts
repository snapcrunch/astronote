import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("settings", (table) => {
    table.string("key").primary();
    table.string("value").notNullable();
  });

  await knex("settings").insert({
    key: "settings",
    value: JSON.stringify({ default_view: "renderer", show_info_panel: true, theme: "default" }),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("settings");
}
