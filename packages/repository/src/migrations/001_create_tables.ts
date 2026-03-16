import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.text('email').notNullable().unique();
    table.text('password').notNullable();
    table.text('salt').notNullable();
  });

  await knex.schema.createTable('collections', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table.integer('isDefault').notNullable().defaultTo(0);
  });

  await knex.schema.createTable('users_collections', (table) => {
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('RESTRICT');
    table
      .integer('collection_id')
      .notNullable()
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE')
      .onUpdate('RESTRICT');
    table.unique(['user_id', 'collection_id']);
  });

  await knex.schema.createTable('notes', (table) => {
    table.text('id').primary();
    table.text('title').notNullable();
    table.text('content').notNullable().defaultTo('');
    table.integer('archived').notNullable().defaultTo(0);
    table.boolean('pinned').notNullable().defaultTo(false);
    table.text('createdAt').notNullable();
    table.text('updatedAt').notNullable();
    table.integer('collectionId').references('id').inTable('collections');
  });

  await knex.schema.createTable('users_notes', (table) => {
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('RESTRICT');
    table
      .text('note_id')
      .notNullable()
      .references('id')
      .inTable('notes')
      .onDelete('CASCADE')
      .onUpdate('RESTRICT');
    table.unique(['user_id', 'note_id']);
  });

  await knex.schema.createTable('tags', (table) => {
    table.text('tag').primary();
    table.integer('count').notNullable().defaultTo(0);
  });

  await knex.schema.createTable('note_tags', (table) => {
    table.text('noteId').notNullable().references('id').inTable('notes');
    table.text('tag').notNullable();
    table.primary(['noteId', 'tag']);
  });

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

  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.text('token').notNullable().unique();
    table.text('expires_at').notNullable();
    table.text('created_at').notNullable();
  });

  await knex.schema.createTable('api_keys', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('token').notNullable();
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('RESTRICT');
    table.unique(['name', 'user_id']);
  });

  await knex.schema.createTable('keyval', (table) => {
    table.text('key').notNullable().primary();
    table.text('value').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('keyval');
  await knex.schema.dropTableIfExists('api_keys');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users_notes');
  await knex.schema.dropTableIfExists('users_collections');
  await knex.schema.dropTableIfExists('note_tags');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('notes');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('collections');
  await knex.schema.dropTableIfExists('users');
}
