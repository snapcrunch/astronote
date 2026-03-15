import 'dotenv/config';
import path from 'node:path';
import fs from 'fs-extra';
import { loadEnv } from '#utils/env';

const config = {
  port: loadEnv<number>('ASTRONOTE_API_PORT', {
    format: 'integer',
    required: true,
  }),
  dbFile: 'astronote.db',
  dataDir: loadEnv<string>('ASTRONOTE_DATA_DIR', {
    format: 'string',
    parse: (raw: unknown) => {
      if (!raw) {
        return path.join(process.cwd(), 'data');
      }
      const val = String(raw);
      if (path.isAbsolute(val)) {
        return val;
      }
      return path.join(process.cwd(), val);
    },
  }),
  dbPath: '',
  jwtSecret: loadEnv<string>('ASTRONOTE_JWT_SECRET', {
    format: 'string',
    required: true,
  }),
  defaultUser: {
    username: loadEnv<string | null | undefined>('ASTRONOTE_DEFAULT_USER', {
      format: 'string',
    }),
    password: loadEnv<string | null | undefined>('ASTRONOTE_DEFAULT_PASSWORD', {
      format: 'string',
    }),
  },
};

config.dbPath = path.join(config.dataDir, config.dbFile);

fs.ensureDirSync(config.dataDir);

export default config;
