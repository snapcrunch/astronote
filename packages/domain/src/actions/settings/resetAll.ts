import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { populateUser } from '../users/populateUser';

export async function resetAll(user: AuthUser): Promise<void> {
  await repository.settings.resetAll(user.id);
  await populateUser(user);
}
