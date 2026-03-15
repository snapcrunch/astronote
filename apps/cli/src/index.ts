import { Command } from 'commander';
import { registerCreateUser } from './commands/createUser';
import { registerSeed } from './commands/seed';
import { registerNotes } from './commands/notes';
import { registerTags } from './commands/tags';
import { registerCollections } from './commands/collections';
import { registerSettings } from './commands/settings';
import { registerHelpAll } from './commands/helpAll';

const program = new Command();

program
  .name('astronote')
  .description('Astronote CLI')
  .option('--user-id <id>', 'Authenticated user ID')
  .option('--db <path>', 'Database file path');

registerCreateUser(program);
registerSeed(program);
registerNotes(program);
registerTags(program);
registerCollections(program);
registerSettings(program);
registerHelpAll(program);

program.parse();
