import repository from '@repo/repository';
import { logger } from '@repo/logger';
import { perform } from '../backup/perform';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

async function checkAndRunBackups(): Promise<void> {
  const users = await repository.users.list();

  for (const user of users) {
    try {
      const settings = await repository.settings.get(user.id);

      if (settings.backup_mechanism === 'disabled') {
        continue;
      }

      if (settings.backup_interval === 'none') {
        continue;
      }

      const lastBackup = await repository.backupHistory.getLast(user.id);
      const now = Date.now();

      if (lastBackup) {
        const elapsed = now - new Date(lastBackup).getTime();
        const interval =
          settings.backup_interval === 'hourly' ? ONE_HOUR_MS : ONE_DAY_MS;

        if (elapsed < interval) {
          continue;
        }
      }

      logger.info({ userId: user.id }, 'Starting scheduled backup');
      await perform({ id: user.id, email: user.email });
    } catch (err) {
      logger.error(
        { userId: user.id, error: err instanceof Error ? err.message : err },
        'Scheduled backup failed'
      );
    }
  }
}

export function monitorBackups(): void {
  // Run at the top of every hour
  const msUntilNextHour = ONE_HOUR_MS - (Date.now() % ONE_HOUR_MS);

  setTimeout(() => {
    checkAndRunBackups();
    setInterval(checkAndRunBackups, ONE_HOUR_MS);
  }, msUntilNextHour);

  logger.info({ nextCheckInMs: msUntilNextHour }, 'Backup monitor scheduled');
}
