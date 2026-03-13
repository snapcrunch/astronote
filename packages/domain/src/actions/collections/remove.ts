import * as repository from "@repo/repository";

export async function remove(id: number): Promise<boolean> {
  return repository.deleteCollection(id);
}
