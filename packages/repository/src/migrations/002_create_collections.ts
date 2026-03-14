import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (table) => {
    table.integer('collectionId').references('id').inTable('collections');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (table) => {
    table.dropColumn('collectionId');
  });
}
