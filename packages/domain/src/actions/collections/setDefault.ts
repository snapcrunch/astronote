import * as repository from "@repo/repository";

export async function setDefault(id: number): Promise<boolean> {
  return repository.setDefaultCollection(id);
}
