import type { Command } from 'commander';
import repository from '@repo/repository';
import domain from '@repo/domain';
import { getDbPath } from '../util';

export function registerCreateUser(program: Command) {
  program
    .command('create-user')
    .description('Create a new user')
    .requiredOption('--email <email>', 'User email address')
    .requiredOption('--password <password>', 'User password')
    .action(async (options: { email: string; password: string }) => {
      await repository.db.init(getDbPath(program));
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
        await repository.db.close();
      }
    });
}
