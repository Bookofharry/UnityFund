import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function auditLog(
  organizationId: string,
  actorUserId: string,
  entityType: string,
  entityId: string,
  action: string,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      organizationId,
      actorUserId,
      entityType,
      entityId,
      action,
      description,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}
