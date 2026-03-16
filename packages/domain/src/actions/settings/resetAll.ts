import type { AuthUser } from '@repo/types';
import * as repository from '@repo/repository';
import { populateUser } from '../users/populateUser';

export async function resetAll(user: AuthUser): Promise<void> {
  await repository.resetAll(user.id);
  await populateUser(user);
}
