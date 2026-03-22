import { Router } from 'express';
import {
  CreateNoteInputSchema,
  UpdateNoteInputSchema,
  ListNotesQuerySchema,
  GraphQuerySchema,
  AddTagInputSchema,
  NoteIdParamSchema,
} from '@repo/types';
import domain from '@repo/domain';
import config from '#config';

export const notesRouter = Router();

notesRouter.get('/export', async (req, res) => {
  const archive = await domain.notes.exportAll(req.user!, config.dataDir);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=notes.zip');

  archive.pipe(res);
  await archive.finalize();
});

notesRouter.get('/', async (req, res) => {
  const result = ListNotesQuerySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const { q, tags, collectionId, includeContent } = result.data;
  const notes = await domain.notes.list(req.user!, {
    query: q,
    tags,
    collectionId,
    includeContent,
  });
  res.json(notes);
});

notesRouter.get('/graph', async (req, res) => {
  const result = GraphQuerySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const { collectionId, tags } = result.data;
  const graph = await domain.notes.graph(req.user!, { collectionId, tags });
  res.json(graph);
});

notesRouter.get('/:id', async (req, res) => {
  const { id } = NoteIdParamSchema.parse(req.params);
  const note = await domain.notes.get(req.user!, id);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
});

notesRouter.post('/', async (req, res) => {
  const result = CreateNoteInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = await domain.notes.create(req.user!, result.data);
  res.status(201).json(note);
});

notesRouter.patch('/:id', async (req, res) => {
  const { id } = NoteIdParamSchema.parse(req.params);
  const result = UpdateNoteInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = await domain.notes.update(req.user!, id, result.data);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
});

notesRouter.post('/:id/tags', async (req, res) => {
  const { id } = NoteIdParamSchema.parse(req.params);
  const result = AddTagInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = await domain.notes.addTag(req.user!, id, result.data.tag.trim());
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
});

notesRouter.delete('/:id/tags/:tag', async (req, res) => {
  const { id } = NoteIdParamSchema.parse(req.params);
  const note = await domain.notes.removeTag(req.user!, id, req.params.tag);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
});

notesRouter.delete('/:id', async (req, res) => {
  const { id } = NoteIdParamSchema.parse(req.params);
  const archived = await domain.notes.remove(req.user!, id, config.dataDir);
  if (!archived) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(204).send();
});
