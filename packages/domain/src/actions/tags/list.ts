import * as repository from "@repo/repository";

export async function list(collectionId?: number): Promise<{ tag: string; count: number }[]> {
  return repository.getTags(collectionId);
}
