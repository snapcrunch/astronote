import * as repository from "@repo/repository";

export async function remove(id: string): Promise<boolean> {
  return repository.archiveNote(id);
}
