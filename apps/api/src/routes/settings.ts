import { Router } from 'express';
import domain from '@repo/domain';
import { SettingsSchema } from '@repo/types';

export const settingsRouter = Router();

settingsRouter.get('/', async (_req, res) => {
  const settings = await domain.settings.get();
  res.json(settings);
});

settingsRouter.patch('/', async (req, res) => {
  const result = SettingsSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const settings = await domain.settings.update(result.data);
  res.json(settings);
});

settingsRouter.post('/reset', async (_req, res) => {
  const defaultCollection = await domain.settings.resetAll();
  res.json(defaultCollection);
});
