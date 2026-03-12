import { Router } from "express";
import archiver from "archiver";
import { CreateNoteInputSchema, UpdateNoteInputSchema } from "@repo/types";
import * as domain from "@repo/domain";

export const notesRouter = Router();

notesRouter.get("/export", async (_req, res) => {
  const entries = await domain.exportNotes();

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=notes.zip");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  for (const { note, collectionName } of entries) {
    const frontmatter = [
      "---",
      `title: ${note.title}`,
      `tags: ${note.tags.join(", ")}`,
      ...(collectionName ? [`collection: ${collectionName}`] : []),
      `pinned: ${note.pinned ? "true" : "false"}`,
      "---",
    ].join("\n");
    const body = `${frontmatter}\n\n${note.content}`;
    const safeName = note.title.replace(/[/\\:*?"<>|]/g, "_");
    archive.append(body, { name: `${safeName}.md` });
  }

  await archive.finalize();
});

notesRouter.get("/", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : undefined;
  const tagsParam = typeof req.query.tags === "string" ? req.query.tags : undefined;
  const tags = tagsParam ? tagsParam.split(",") : undefined;
  const collectionParam = typeof req.query.collectionId === "string" ? req.query.collectionId : undefined;
  const collectionId = collectionParam ? Number(collectionParam) : undefined;
  const notes = await domain.listNotes(query, tags, collectionId);
  res.json(notes);
});

notesRouter.get("/:id", async (req, res) => {
  const note = await domain.getNote(req.params.id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.post("/", async (req, res) => {
  const result = CreateNoteInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const collectionId = typeof req.body.collectionId === "number" ? req.body.collectionId : undefined;
  const tags = Array.isArray(req.body.tags) ? req.body.tags.filter((t: unknown) => typeof t === "string") : undefined;
  const pinned = typeof req.body.pinned === "boolean" ? req.body.pinned : undefined;
  const note = await domain.createNote({ ...result.data, tags, collectionId, pinned });
  res.status(201).json(note);
});

notesRouter.patch("/:id", async (req, res) => {
  const result = UpdateNoteInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = await domain.updateNote(req.params.id, result.data);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.post("/:id/tags", async (req, res) => {
  const { tag } = req.body;
  if (typeof tag !== "string" || !tag.trim()) {
    res.status(400).json({ error: "tag is required" });
    return;
  }
  const note = await domain.addTag(req.params.id, tag.trim());
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.delete("/:id/tags/:tag", async (req, res) => {
  const note = await domain.removeTag(req.params.id, req.params.tag);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.delete("/:id", async (req, res) => {
  const archived = await domain.archiveNote(req.params.id);
  if (!archived) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.status(204).send();
});
