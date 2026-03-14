import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (t) => {
    t.boolean('pinned').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (t) => {
    t.dropColumn('pinned');
  });
}
