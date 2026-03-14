import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '@repo/repository';

const JWT_SECRET = process.env.JWT_SECRET ?? 'astronote-dev-secret';

export async function login(
  email: string,
  password: string
): Promise<{ token: string }> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new InvalidCredentialsError();
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '5m',
  });

  return { token };
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}
