import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const row = await knex('settings').where('key', 'settings').first();
  if (!row) return;

  const settings = JSON.parse(row.value as string);
  delete settings.auth_method;
  delete settings.auth_username;
  delete settings.auth_password;

  await knex('settings')
    .where('key', 'settings')
    .update({ value: JSON.stringify(settings) });
}

export async function down(knex: Knex): Promise<void> {
  const row = await knex('settings').where('key', 'settings').first();
  if (!row) return;

  const settings = JSON.parse(row.value as string);
  settings.auth_method = 'none';
  settings.auth_username = '';
  settings.auth_password = '';

  await knex('settings')
    .where('key', 'settings')
    .update({ value: JSON.stringify(settings) });
}
