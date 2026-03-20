import repository from '@repo/repository';
import { logger } from '@repo/logger';
import domain from '@repo/domain';
import { setJwtSecret } from '../../config';
import { monitorBackups } from './monitorBackups';

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
  await repository.db.init(dbPath);

  const settings = await domain.systemSettings.get();

  if (!settings.initialized) {
    if (defaultUsername && defaultPassword) {
      await domain.users.createUser(defaultUsername, defaultPassword);
      logger.info(`Default user created with email: ${defaultUsername}`);
    }
    await domain.systemSettings.patch({ initialized: true });
  }

  monitorBackups();
};

export { init };
