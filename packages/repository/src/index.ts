import initSqlJs, { type Database } from "sql.js";
import fs from "node:fs";
import type { Note } from "@repo/types";

let db: Database;
let dbPath: string;

function save(): void {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

export async function initDatabase(path: string): Promise<void> {
  dbPath = path;
  const SQL = await initSqlJs();

  if (fs.existsSync(path)) {
    const buffer = fs.readFileSync(path);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  save();
}

export function getNotes(query?: string): Note[] {
  let stmt;
  if (query) {
    const pattern = `%${query}%`;
    stmt = db.prepare(
      "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updatedAt DESC",
    );
    stmt.bind([pattern, pattern]);
  } else {
    stmt = db.prepare("SELECT * FROM notes ORDER BY updatedAt DESC");
  }

  const results: Note[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as Note);
  }
  stmt.free();
  return results;
}

export function getNoteById(id: string): Note | null {
  const stmt = db.prepare("SELECT * FROM notes WHERE id = ?");
  stmt.bind([id]);
  let result: Note | null = null;
  if (stmt.step()) {
    result = stmt.getAsObject() as unknown as Note;
  }
  stmt.free();
  return result;
}

export function createNote(note: Note): Note {
  db.run(
    "INSERT INTO notes (id, title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
    [note.id, note.title, note.content, note.createdAt, note.updatedAt],
  );
  save();
  return note;
}

export function updateNote(
  id: string,
  updates: { title?: string; content?: string; updatedAt: string },
): Note | null {
  const existing = getNoteById(id);
  if (!existing) return null;

  const title = updates.title ?? existing.title;
  const content = updates.content ?? existing.content;

  db.run("UPDATE notes SET title = ?, content = ?, updatedAt = ? WHERE id = ?", [
    title,
    content,
    updates.updatedAt,
    id,
  ]);
  save();

  return { ...existing, title, content, updatedAt: updates.updatedAt };
}

export function deleteNote(id: string): boolean {
  const existing = getNoteById(id);
  if (!existing) return false;
  db.run("DELETE FROM notes WHERE id = ?", [id]);
  save();
  return true;
}

export function getNoteCount(): number {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM notes");
  stmt.step();
  const row = stmt.getAsObject() as { count: number };
  stmt.free();
  return row.count;
}
