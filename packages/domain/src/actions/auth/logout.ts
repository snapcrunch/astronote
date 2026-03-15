import { deleteRefreshToken } from '@repo/repository';

export async function logout(refreshToken: string): Promise<void> {
  await deleteRefreshToken(refreshToken);
}
