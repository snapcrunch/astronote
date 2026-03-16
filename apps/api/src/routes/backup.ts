import { Router } from 'express';
import domain from '@repo/domain';

export const backupRouter = Router();

backupRouter.post('/', async (req, res) => {
  try {
    await domain.backup.perform(req.user!);
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backup failed';
    if (message === 'Backup mechanism is not configured') {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: message });
    }
  }
});
