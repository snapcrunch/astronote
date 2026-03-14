import type { Settings, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function update(
  user: AuthUser,
  updates: Partial<Settings>
): Promise<Settings> {
  return repository.updateSettings(user.id, updates);
}
