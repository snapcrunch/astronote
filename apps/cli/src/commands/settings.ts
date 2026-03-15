import type { Command } from 'commander';
import domain from '@repo/domain';
import { getUser, run } from '../util';

export function registerSettings(program: Command) {
  const settingsCmd = program
    .command('settings')
    .description('Manage settings');

  settingsCmd
    .command('get')
    .description('Get user settings')
    .action(async () => {
      await run(program, () => domain.settings.get(getUser(program)));
    });

  settingsCmd
    .command('update')
    .description('Update a setting')
    .requiredOption('--key <key>', 'Setting key')
    .requiredOption('--value <value>', 'Setting value')
    .action(async (opts: { key: string; value: string }) => {
      await run(program, () =>
        domain.settings.update(getUser(program), { [opts.key]: opts.value })
      );
    });
}
