import * as repository from '@repo/repository';

export async function get(): Promise<Record<string, unknown>> {
  return repository.getSystemSettings();
}
