import type { Settings, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function update(
  user: AuthUser,
  updates: Partial<Settings>
): Promise<Settings> {
  return repository.settings.update(user.id, updates);
}
