import { Router } from 'express';
import {
  CreateNoteInputSchema,
  UpdateNoteInputSchema,
  ListNotesQuerySchema,
  AddTagInputSchema,
} from '@repo/types';
import domain from '@repo/domain';

export const notesRouter = Router();

notesRouter.get('/export', async (req, res) => {
  const archive = await domain.notes.exportAll(req.user!);

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
  const { q, tags, collectionId } = result.data;
  const notes = await domain.notes.list(req.user!, q, tags, collectionId);
  res.json(notes);
});

notesRouter.get('/:id', async (req, res) => {
  const note = await domain.notes.get(req.user!, req.params.id);
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
  const result = UpdateNoteInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = await domain.notes.update(req.user!, req.params.id, result.data);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
});

notesRouter.post('/:id/tags', async (req, res) => {
  const result = AddTagInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const note = await domain.notes.addTag(
    req.user!,
    req.params.id,
    result.data.tag.trim()
  );
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
});

notesRouter.delete('/:id/tags/:tag', async (req, res) => {
  const note = await domain.notes.removeTag(
    req.user!,
    req.params.id,
    req.params.tag
  );
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
});

notesRouter.delete('/:id', async (req, res) => {
  const archived = await domain.notes.remove(req.user!, req.params.id);
  if (!archived) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(204).send();
});
