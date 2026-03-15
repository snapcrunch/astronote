import type { Command } from 'commander';
import domain from '@repo/domain';
import { getUser, run } from '../util';

export function registerTags(program: Command) {
  const tagsCmd = program.command('tags').description('Manage tags');

  tagsCmd
    .command('list')
    .description('List tags')
    .option('--collection-id <id>', 'Collection ID')
    .action(async (opts: { collectionId?: string }) => {
      await run(program, () =>
        domain.tags.list(
          getUser(program),
          opts.collectionId ? Number(opts.collectionId) : undefined
        )
      );
    });
}
