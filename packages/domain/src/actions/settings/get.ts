import type { Settings, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function get(user: AuthUser): Promise<Settings> {
  return repository.settings.get(user.id);
}
