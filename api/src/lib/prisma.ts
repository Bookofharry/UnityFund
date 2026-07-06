import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Default interactive-transaction timeout (5s) is too tight for our hosted DB's
    // observed round-trip latency — multi-query transactions (e.g. cycle start,
    // payment confirmation) can get closed by Prisma before the last query runs,
    // surfacing as P2028 "Transaction not found".
    transactionOptions: { maxWait: 10000, timeout: 20000 },
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
