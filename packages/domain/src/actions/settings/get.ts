import type { Settings } from '@repo/types';
import * as repository from '@repo/repository';

export async function get(): Promise<Settings> {
  return repository.getSettings();
}
