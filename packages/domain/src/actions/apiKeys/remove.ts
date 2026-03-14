import type { AuthUser } from '@repo/types';
import { deleteApiKey } from '@repo/repository';

export async function remove(user: AuthUser, id: string): Promise<boolean> {
  return deleteApiKey(user.id, id);
}
