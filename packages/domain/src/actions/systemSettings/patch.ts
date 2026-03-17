import repository from '@repo/repository';

export async function patch(settings: Record<string, unknown>): Promise<void> {
  return repository.systemSettings.patch(settings);
}
