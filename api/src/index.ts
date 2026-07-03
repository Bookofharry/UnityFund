import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { webhookService } from './modules/webhooks/webhook.service';

async function main() {
  // Verify DB connection before accepting traffic
  await prisma.$connect();
  logger.info('Database connection established');

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`UnityFund API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // H2: periodic sweep to retry webhook_events stuck at 'failed' — see
  // WebhookService.reprocessFailed for why this exists.
  setInterval(() => {
    webhookService.reprocessFailed().catch((err) => {
      logger.error({ err }, 'Webhook reprocess sweep failed');
    });
  }, env.WEBHOOK_REPROCESS_INTERVAL_MS);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
