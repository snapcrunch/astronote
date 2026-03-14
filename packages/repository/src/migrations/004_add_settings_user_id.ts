import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable('settings');

  await knex.schema.createTable('settings', (table) => {
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('RESTRICT');
    table.string('key').notNullable();
    table.string('value').notNullable();
    table.primary(['user_id', 'key']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('settings');

  await knex.schema.createTable('settings', (table) => {
    table.string('key').primary();
    table.string('value').notNullable();
  });
}
