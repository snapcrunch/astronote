import { Router } from "express";
import { CreateNoteInputSchema, UpdateNoteInputSchema } from "@repo/types";
import * as domain from "@repo/domain";

export const notesRouter = Router();

notesRouter.get("/", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : undefined;
  const tagsParam = typeof req.query.tags === "string" ? req.query.tags : undefined;
  const tags = tagsParam ? tagsParam.split(",") : undefined;
  const notes = domain.listNotes(query, tags);
  res.json(notes);
});

notesRouter.get("/:id", (req, res) => {
  const note = domain.getNote(req.params.id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.post("/", (req, res) => {
  const result = CreateNoteInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = domain.createNote(result.data);
  res.status(201).json(note);
});

notesRouter.patch("/:id", (req, res) => {
  const result = UpdateNoteInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = domain.updateNote(req.params.id, result.data);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.post("/:id/tags", (req, res) => {
  const { tag } = req.body;
  if (typeof tag !== "string" || !tag.trim()) {
    res.status(400).json({ error: "tag is required" });
    return;
  }
  const note = domain.addTag(req.params.id, tag.trim());
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.delete("/:id/tags/:tag", (req, res) => {
  const note = domain.removeTag(req.params.id, req.params.tag);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

notesRouter.delete("/:id", (req, res) => {
  const archived = domain.archiveNote(req.params.id);
  if (!archived) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.status(204).send();
});
