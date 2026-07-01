import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

async function main() {
  // Verify DB connection before accepting traffic
  await prisma.$connect();
  logger.info('Database connection established');

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`UnityFund API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
