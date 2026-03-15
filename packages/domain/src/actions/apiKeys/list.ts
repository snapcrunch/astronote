import type { AuthUser, ApiKey } from '@repo/types';
import { getApiKeys } from '@repo/repository';

export async function list(user: AuthUser): Promise<ApiKey[]> {
  return getApiKeys(user.id);
}
