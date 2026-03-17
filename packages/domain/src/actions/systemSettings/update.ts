import repository from '@repo/repository';

export async function update(settings: Record<string, unknown>): Promise<void> {
  return repository.systemSettings.update(settings);
}
