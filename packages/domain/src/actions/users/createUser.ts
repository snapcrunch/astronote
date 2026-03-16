import bcrypt from 'bcryptjs';
import { createUser as repoCreateUser, getUserByEmail } from '@repo/repository';
import { populateUser } from './populateUser';

export async function createUser(
  email: string,
  password: string
): Promise<{ id: number }> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new UserAlreadyExistsError(email);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await repoCreateUser(email, hashedPassword, salt);

  await populateUser({ id: user.id, email });

  return user;
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}
