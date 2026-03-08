import * as domain from "@repo/domain";
import { getNoteCount } from "@repo/repository";
import seedNotes from "./notes.json" with { type: "json" };

export function seedDatabase(): void {
  if (getNoteCount() > 0) return;

  for (const note of seedNotes) {
    domain.createNote({ title: note.title, content: note.content });
  }

  console.log(`Seeded database with ${seedNotes.length} notes`);
}
