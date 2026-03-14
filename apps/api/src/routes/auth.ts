import { Router } from 'express';
import jwt from 'jsonwebtoken';
import domain from '@repo/domain';

const JWT_SECRET = process.env.JWT_SECRET ?? 'astronote-dev-secret';

export const authRouter = Router();

authRouter.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const result = await domain.auth.login(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof domain.auth.InvalidCredentialsError) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    throw err;
  }
});

authRouter.get('/', (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    res.json({ id: payload.id, email: payload.email });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});
