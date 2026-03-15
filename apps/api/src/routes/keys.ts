import { Router } from 'express';
import { CreateApiKeyInputSchema, UuidParamSchema } from '@repo/types';
import domain from '@repo/domain';

export const keysRouter = Router();

keysRouter.get('/', async (req, res) => {
  const keys = await domain.apiKeys.list(req.user!);
  res.json(keys);
});

keysRouter.post('/', async (req, res) => {
  const result = CreateApiKeyInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const key = await domain.apiKeys.create(req.user!, result.data.name.trim());
  res.status(201).json(key);
});

keysRouter.delete('/:id', async (req, res) => {
  const result = UuidParamSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const deleted = await domain.apiKeys.remove(req.user!, result.data.id);
  if (!deleted) {
    res.status(404).json({ error: 'API key not found' });
    return;
  }
  res.status(204).send();
});
