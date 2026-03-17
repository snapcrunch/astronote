import type { AuthUser, ApiKey } from '@repo/types';
import repository from '@repo/repository';

export async function list(user: AuthUser): Promise<ApiKey[]> {
  return repository.apiKeys.list(user.id);
}
