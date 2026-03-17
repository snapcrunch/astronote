import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function remove(user: AuthUser, id: string): Promise<boolean> {
  return repository.apiKeys.remove(user.id, id);
}
