import * as repository from "@repo/repository";

export async function exportAll() {
  return repository.getNotesForExport();
}
