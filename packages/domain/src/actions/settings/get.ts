import type { Settings, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function get(user: AuthUser): Promise<Settings> {
  return repository.getSettings(user.id);
}
