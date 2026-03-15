import * as repository from '@repo/repository';

export async function update(settings: Record<string, unknown>): Promise<void> {
  return repository.updateSystemSettings(settings);
}
