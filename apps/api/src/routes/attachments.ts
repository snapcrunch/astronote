import path from 'node:path';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { NoteIdParamSchema, UuidParamSchema } from '@repo/types';
import type { AuthUser } from '@repo/types';
import domain from '@repo/domain';
import config from '#config';

const upload = multer({
  dest: path.join(config.dataDir, 'tmp'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * Authenticate via Bearer header OR ?token= query param.
 * Used for routes that need to support embedded img tags.
 */
function flexAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), config.jwtSecret) as AuthUser;
      req.user = { id: payload.id, email: payload.email };
      next();
      return;
    } catch {
      // fall through to token param
    }
  }
  if (req.query.token) {
    try {
      const payload = jwt.verify(
        String(req.query.token),
        config.jwtSecret
      ) as AuthUser;
      req.user = { id: payload.id, email: payload.email };
      next();
      return;
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Note-scoped routes — mounted at /api/notes behind requireAuth
export const noteAttachmentsRouter = Router();

noteAttachmentsRouter.get('/:id/attachments', async (req, res) => {
  const result = NoteIdParamSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const attachments = await domain.attachments.list(req.user!, result.data.id);
  res.json(attachments);
});

noteAttachmentsRouter.post(
  '/:id/attachments',
  upload.single('file'),
  async (req, res) => {
    const result = NoteIdParamSchema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten().fieldErrors });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }
    const attachment = await domain.attachments.upload(
      req.user!,
      result.data.id,
      req.file,
      config.dataDir
    );
    res.status(201).json(attachment);
  }
);

// Attachment-scoped routes — mounted at /api/attachments with flexible auth
export const attachmentsRouter = Router();

attachmentsRouter.use(flexAuth);

attachmentsRouter.get('/:id/file', async (req, res) => {
  const result = UuidParamSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const attachment = await domain.attachments.get(
    req.user!,
    result.data.id,
    config.dataDir
  );
  if (!attachment) {
    res.status(404).json({ error: 'Attachment not found' });
    return;
  }
  res.setHeader('Content-Type', attachment.attachment.mimeType);
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${attachment.attachment.filename}"`
  );
  res.sendFile(attachment.absolutePath);
});

attachmentsRouter.delete('/:id', async (req, res) => {
  const result = UuidParamSchema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }
  const deleted = await domain.attachments.remove(
    req.user!,
    result.data.id,
    config.dataDir
  );
  if (!deleted) {
    res.status(404).json({ error: 'Attachment not found' });
    return;
  }
  res.status(204).send();
});
