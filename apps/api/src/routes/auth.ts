import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '@repo/repository';
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

authRouter.get('/', async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const user = await getUserById(payload.id);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    res.json({ id: user.id, email: user.email });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  try {
    const result = await domain.auth.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    if (err instanceof domain.auth.InvalidRefreshTokenError) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }
    throw err;
  }
});

authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await domain.auth.logout(refreshToken);
  }
  res.status(204).send();
});
