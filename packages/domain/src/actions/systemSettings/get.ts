import repository from '@repo/repository';

export async function get(): Promise<Record<string, unknown>> {
  return repository.systemSettings.get();
}
