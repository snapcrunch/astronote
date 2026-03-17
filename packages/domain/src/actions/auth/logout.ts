import repository from '@repo/repository';

export async function logout(refreshToken: string): Promise<void> {
  await repository.refreshTokens.deleteByToken(refreshToken);
}
