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
      archived INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      tag TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Add archived column to existing databases
  const cols = db.exec("PRAGMA table_info(notes)");
  const hasArchived = cols[0]?.values.some((row) => row[1] === "archived");
  if (!hasArchived) {
    db.run("ALTER TABLE notes ADD COLUMN archived INTEGER NOT NULL DEFAULT 0");
  }

  save();
}

export function getNotes(query?: string, tags?: string[]): Note[] {
  let sql = "SELECT * FROM notes WHERE archived = 0";
  const params: string[] = [];

  if (query) {
    const pattern = `%${query}%`;
    sql += " AND (title LIKE ? OR content LIKE ?)";
    params.push(pattern, pattern);
  }

  if (tags && tags.length > 0) {
    for (const tag of tags) {
      sql += " AND (title || ' ' || content) LIKE ?";
      params.push(`%${tag}%`);
    }
  }

  sql += " ORDER BY updatedAt DESC";

  const stmt = db.prepare(sql);
  stmt.bind(params);

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

export function archiveNote(id: string): boolean {
  const existing = getNoteById(id);
  if (!existing) return false;
  db.run("UPDATE notes SET archived = 1, updatedAt = ? WHERE id = ?", [
    new Date().toISOString(),
    id,
  ]);
  save();
  return true;
}

export function incrementTags(tags: string[]): void {
  if (tags.length === 0) return;
  for (const tag of tags) {
    db.run(
      "INSERT INTO tags (tag, count) VALUES (?, 1) ON CONFLICT(tag) DO UPDATE SET count = count + 1",
      [tag],
    );
  }
  save();
}

export function decrementTags(tags: string[]): void {
  if (tags.length === 0) return;
  for (const tag of tags) {
    db.run("UPDATE tags SET count = count - 1 WHERE tag = ?", [tag]);
  }
  db.run("DELETE FROM tags WHERE count <= 0");
  save();
}

export function getTags(): { tag: string; count: number }[] {
  const stmt = db.prepare("SELECT tag, count FROM tags ORDER BY count DESC, tag ASC");
  const results: { tag: string; count: number }[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as { tag: string; count: number });
  }
  stmt.free();
  return results;
}

export function getNoteCount(): number {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM notes WHERE archived = 0");
  stmt.step();
  const row = stmt.getAsObject() as { count: number };
  stmt.free();
  return row.count;
}
