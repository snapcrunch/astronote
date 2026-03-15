import type { Command } from 'commander';
import domain from '@repo/domain';
import { getUser, run } from '../util';

export function registerCollections(program: Command) {
  const collectionsCmd = program
    .command('collections')
    .description('Manage collections');

  collectionsCmd
    .command('list')
    .description('List collections')
    .action(async () => {
      await run(program, () => domain.collections.list(getUser(program)));
    });

  collectionsCmd
    .command('create')
    .description('Create a collection')
    .requiredOption('--name <name>', 'Collection name')
    .action(async (opts: { name: string }) => {
      await run(program, () =>
        domain.collections.create(getUser(program), opts.name)
      );
    });

  collectionsCmd
    .command('delete')
    .description('Delete a collection')
    .requiredOption('--id <id>', 'Collection ID')
    .action(async (opts: { id: string }) => {
      await run(program, () =>
        domain.collections.remove(getUser(program), Number(opts.id))
      );
    });
}
