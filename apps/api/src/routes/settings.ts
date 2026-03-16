import { Router } from 'express';
import domain from '@repo/domain';
import { SettingsSchema } from '@repo/types';

export const settingsRouter = Router();

settingsRouter.get('/', async (req, res) => {
  const settings = await domain.settings.get(req.user!);
  res.json(settings);
});

settingsRouter.patch('/', async (req, res) => {
  const result = SettingsSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const settings = await domain.settings.update(req.user!, result.data);
  res.json(settings);
});

settingsRouter.post('/reset', async (req, res) => {
  await domain.settings.resetAll(req.user!);
  res.status(204).send();
});
