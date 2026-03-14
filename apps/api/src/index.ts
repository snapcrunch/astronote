import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { initDatabase, seedDatabase } from '@repo/repository';
import { notesRouter } from '#routes/notes';
import { tagsRouter } from '#routes/tags';
import { collectionsRouter } from '#routes/collections';
import { settingsRouter } from '#routes/settings';
import { authRouter } from '#routes/auth';
import { requestLogger } from '#middleware/requestLogger';
import { requireAuth } from '#middleware/requireAuth';
import { errorHandler } from '#middleware/errorHandler';
import { basicAuth } from '#middleware/basicAuth';

const PORT = process.env.PORT ?? 3009;
const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'astronote.db');

async function main() {
  await initDatabase(DB_PATH);
  await seedDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  app.use(requestLogger);
  app.use('/api/auth', authRouter);
  app.use(basicAuth);
  app.use('/api/notes', requireAuth, notesRouter);
  app.use('/api/tags', requireAuth, tagsRouter);
  app.use('/api/collections', requireAuth, collectionsRouter);
  app.use('/api/settings', settingsRouter);
  app.use(errorHandler);

  // Serve built frontend static files
  const staticDir = path.resolve(import.meta.dirname, '../../web-app/dist');
  app.use(express.static(staticDir));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

main();
