import type { Command } from 'commander';
import { initDatabase, seedDatabase, closeDatabase } from '@repo/repository';
import { getDbPath } from '../util';

export function registerSeed(program: Command) {
  program
    .command('seed')
    .description('Run database seeds')
    .action(async () => {
      await initDatabase(getDbPath(program));
      try {
        await seedDatabase();
        console.log('Database seeded successfully');
      } finally {
        await closeDatabase();
      }
    });
}
