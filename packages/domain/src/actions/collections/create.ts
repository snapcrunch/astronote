import type { Collection } from "@repo/types";
import * as repository from "@repo/repository";

export async function create(name: string): Promise<Collection> {
  return repository.createCollection(name);
}
