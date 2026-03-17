import { execFile } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { writeFile, chmod, rm } from 'node:fs/promises';
import { join } from 'node:path';
import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { logger } from '@repo/logger';
import { exportAll } from '../notes/exportAll';

function git(
  args: string[],
  opts: { cwd?: string; env?: Record<string, string> }
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      args,
      { cwd: opts.cwd, env: { ...process.env, ...opts.env } },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`git ${args[0]} failed: ${stderr || err.message}`));
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

export async function perform(user: AuthUser): Promise<void> {
  const settings = await repository.settings.get(user.id);

  if (settings.backup_mechanism === 'disabled') {
    throw new Error('Backup mechanism is not configured');
  }

  const timestamp = Date.now();
  const tmpDir = `/tmp/astronote-backup-${timestamp}`;
  const keyFile = `/tmp/astronote-backup-${timestamp}-key`;

  try {
    // Write SSH key to temp file
    await writeFile(keyFile, settings.backup_ssh_private_key + '\n', 'utf-8');
    await chmod(keyFile, 0o600);

    const gitEnv = {
      GIT_SSH_COMMAND: `ssh -i ${keyFile} -o StrictHostKeyChecking=no`,
    };

    // Clone the repo
    logger.info({ url: settings.backup_repo_ssh_url }, 'Cloning backup repo');
    await git(['clone', '--depth', '1', settings.backup_repo_ssh_url, tmpDir], {
      env: gitEnv,
    });

    // Configure git user in the cloned repo
    await git(['config', 'user.email', 'backup@astronote.app'], {
      cwd: tmpDir,
    });
    await git(['config', 'user.name', 'Astronote Backup'], { cwd: tmpDir });

    // Export notes as zip into the cloned repo
    const archive = await exportAll(user);
    const zipPath = join(tmpDir, 'notes.zip');
    const output = createWriteStream(zipPath);
    archive.pipe(output);
    await archive.finalize();
    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });

    // Stage, commit, and force push
    await git(['add', 'notes.zip'], { cwd: tmpDir, env: gitEnv });
    await git(
      ['commit', '-m', `Astronote backup ${new Date().toISOString()}`],
      { cwd: tmpDir, env: gitEnv }
    );
    await git(['push', '--force'], { cwd: tmpDir, env: gitEnv });

    await repository.backupHistory.record(user.id);
    logger.info('Backup completed successfully');
  } finally {
    // Clean up temp files
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    await rm(keyFile, { force: true }).catch(() => {});
  }
}
