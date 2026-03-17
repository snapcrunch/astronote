import type { Command } from 'commander';
import repository from '@repo/repository';
import { getDbPath } from '../util';

export function registerSeed(program: Command) {
  program
    .command('seed')
    .description('Run database seeds')
    .action(async () => {
      await repository.db.init(getDbPath(program));
      try {
        await repository.db.seed();
        console.log('Database seeded successfully');
      } finally {
        await repository.db.close();
      }
    });
}
