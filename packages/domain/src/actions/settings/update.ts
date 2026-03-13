import type { Settings } from "@repo/types";
import * as repository from "@repo/repository";

export async function update(updates: Partial<Settings>): Promise<Settings> {
  return repository.updateSettings(updates);
}
