import { initDatabase } from '@repo/repository';
import { logger } from '@repo/logger';
import domain from '@repo/domain';
import { setJwtSecret } from '../../config';

const init = async ({
  dbPath,
  jwtSecret,
  defaultUsername,
  defaultPassword,
}: {
  dbPath: string;
  jwtSecret: string;
  defaultUsername?: string | null;
  defaultPassword?: string | null;
}) => {
  setJwtSecret(jwtSecret);
  await initDatabase(dbPath);

  const settings = await domain.systemSettings.get();

  if (!settings.initialized) {
    if (defaultUsername && defaultPassword) {
      await domain.users.createUser(defaultUsername, defaultPassword);
      logger.info(`Default user created with email: ${defaultUsername}`);
    }
    await domain.systemSettings.patch({ initialized: true });
  }
};

export { init };
