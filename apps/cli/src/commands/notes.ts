import type { Command } from 'commander';
import domain from '@repo/domain';
import { getUser, run } from '../util';

export function registerNotes(program: Command) {
  const notesCmd = program.command('notes').description('Manage notes');

  notesCmd
    .command('list')
    .description('List notes')
    .option('--query <q>', 'Search query')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--collection-id <id>', 'Collection ID')
    .action(
      async (opts: {
        query?: string;
        tags?: string;
        collectionId?: string;
      }) => {
        await run(program, () => {
          const tags = opts.tags ? opts.tags.split(',') : undefined;
          const collectionId = opts.collectionId
            ? Number(opts.collectionId)
            : undefined;
          return domain.notes.list(getUser(program), {
            query: opts.query,
            tags,
            collectionId,
          });
        });
      }
    );

  notesCmd
    .command('get')
    .description('Get a note by ID')
    .requiredOption('--id <id>', 'Note ID')
    .action(async (opts: { id: string }) => {
      await run(program, () =>
        domain.notes.get(getUser(program), Number(opts.id))
      );
    });

  notesCmd
    .command('create')
    .description('Create a note')
    .requiredOption('--title <title>', 'Note title')
    .option('--content <content>', 'Note content')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--collection-id <id>', 'Collection ID')
    .action(
      async (opts: {
        title: string;
        content?: string;
        tags?: string;
        collectionId?: string;
      }) => {
        await run(program, () =>
          domain.notes.create(getUser(program), {
            title: opts.title,
            content: opts.content,
            tags: opts.tags ? opts.tags.split(',') : undefined,
            collectionId: opts.collectionId
              ? Number(opts.collectionId)
              : undefined,
          })
        );
      }
    );

  notesCmd
    .command('update')
    .description('Update a note')
    .requiredOption('--id <id>', 'Note ID')
    .option('--title <title>', 'New title')
    .option('--content <content>', 'New content')
    .option('--pinned <pinned>', 'Pin or unpin (true/false)')
    .option('--collection-id <id>', 'Collection ID')
    .action(
      async (opts: {
        id: string;
        title?: string;
        content?: string;
        pinned?: string;
        collectionId?: string;
      }) => {
        await run(program, () =>
          domain.notes.update(getUser(program), Number(opts.id), {
            title: opts.title,
            content: opts.content,
            pinned:
              opts.pinned !== undefined ? opts.pinned === 'true' : undefined,
            collectionId: opts.collectionId
              ? Number(opts.collectionId)
              : undefined,
          })
        );
      }
    );

  notesCmd
    .command('delete')
    .description('Delete a note')
    .requiredOption('--id <id>', 'Note ID')
    .action(async (opts: { id: string }) => {
      await run(program, () =>
        domain.notes.remove(getUser(program), Number(opts.id))
      );
    });

  notesCmd
    .command('add-tag')
    .description('Add a tag to a note')
    .requiredOption('--id <id>', 'Note ID')
    .requiredOption('--tag <tag>', 'Tag to add')
    .action(async (opts: { id: string; tag: string }) => {
      await run(program, () =>
        domain.notes.addTag(getUser(program), Number(opts.id), opts.tag)
      );
    });

  notesCmd
    .command('remove-tag')
    .description('Remove a tag from a note')
    .requiredOption('--id <id>', 'Note ID')
    .requiredOption('--tag <tag>', 'Tag to remove')
    .action(async (opts: { id: string; tag: string }) => {
      await run(program, () =>
        domain.notes.removeTag(getUser(program), Number(opts.id), opts.tag)
      );
    });
}
