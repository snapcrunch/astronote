import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('attachments', (table) => {
    table.text('id').primary();
    table
      .bigInteger('noteId')
      .notNullable()
      .references('id')
      .inTable('notes')
      .onDelete('CASCADE');
    table
      .integer('userId')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.text('filename').notNullable();
    table.text('mimeType').notNullable();
    table.integer('size').notNullable();
    table.text('storagePath').notNullable();
    table.text('createdAt').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('attachments');
}
