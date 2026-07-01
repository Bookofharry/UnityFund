import { beforeAll, afterAll } from 'vitest';
import { prisma } from '../lib/prisma';

beforeAll(async () => {
  // Tests run against a real test database (DATABASE_URL should point to test DB)
  // No mocking of the database layer
});

afterAll(async () => {
  await prisma.$disconnect();
});
