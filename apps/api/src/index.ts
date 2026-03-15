import path from 'node:path';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { notesRouter } from '#routes/notes';
import { tagsRouter } from '#routes/tags';
import { collectionsRouter } from '#routes/collections';
import { settingsRouter } from '#routes/settings';
import { keysRouter } from '#routes/keys';
import { authRouter } from '#routes/auth';
import { requestLogger } from '#middleware/requestLogger';
import { requireAuth } from '#middleware/requireAuth';
import { errorHandler } from '#middleware/errorHandler';
import { claudeAuthRouter } from './routes/claude-auth.js';
import { claudePromptRouter } from './routes/claude-prompt.js';
import { openApiSpec } from './openapi.js';
import config from '#config';
import domain from '@repo/domain';
import { logger } from '@repo/logger';

async function main() {
  logger.info(
    { dbPath: config.dbPath },
    `Data will be stored in: ${config.dataDir}`
  );
  await domain.system.init({
    dbPath: config.dbPath,
    jwtSecret: config.jwtSecret,
    defaultUsername: config.defaultUser.username,
    defaultPassword: config.defaultUser.password,
  });
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  app.use('/docs/api', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use(requestLogger);
  app.use('/api/auth', authRouter);
  app.use('/api/notes', requireAuth, notesRouter);
  app.use('/api/tags', requireAuth, tagsRouter);
  app.use('/api/collections', requireAuth, collectionsRouter);
  app.use('/api/keys', requireAuth, keysRouter);
  app.use('/api/settings', requireAuth, settingsRouter);
  app.use('/api/claude/auth', requireAuth, claudeAuthRouter);
  app.use('/api/claude/prompt', requireAuth, claudePromptRouter(config.dbPath));
  app.use(errorHandler);

  // Serve built frontend static files
  const staticDir = path.resolve(import.meta.dirname, '../../web-app/dist');
  app.use(express.static(staticDir));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });

  app.listen(config.port, () => {
    logger.info({ port: config.port }, 'API server is running.');
  });
}

main();
