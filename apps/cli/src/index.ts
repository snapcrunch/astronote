import path from 'node:path';
import { Command } from 'commander';
import { initDatabase, seedDatabase, closeDatabase } from '@repo/repository';
import domain from '@repo/domain';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'astronote.db');

const program = new Command();

program.name('astronote').description('Astronote CLI administration tool');

program
  .command('create-user')
  .description('Create a new user')
  .requiredOption('--email <email>', 'User email address')
  .requiredOption('--password <password>', 'User password')
  .action(async (options: { email: string; password: string }) => {
    await initDatabase(DB_PATH);

    try {
      const { id } = await domain.users.createUser(
        options.email,
        options.password
      );
      console.log(`User created successfully (id: ${id})`);
    } catch (error) {
      if (error instanceof domain.users.UserAlreadyExistsError) {
        console.error(error.message);
        process.exit(1);
      }
      throw error;
    } finally {
      await closeDatabase();
    }
  });

program
  .command('seed')
  .description('Run database seeds')
  .action(async () => {
    await initDatabase(DB_PATH);

    try {
      await seedDatabase();
      console.log('Database seeded successfully');
    } finally {
      await closeDatabase();
    }
  });

program.parse();
