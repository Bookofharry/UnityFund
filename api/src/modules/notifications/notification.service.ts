import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

const NOTIF_SELECT = {
  id: true,
  userId: true,
  organizationId: true,
  title: true,
  message: true,
  type: true,
  readAt: true,
  createdAt: true,
};

export class NotificationService {
  async create(params: {
    userId: string;
    organizationId: string;
    type: string;
    title: string;
    message: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        title: params.title,
        message: params.message,
        type: params.type,
      },
      select: NOTIF_SELECT,
    });
  }

  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      select: NOTIF_SELECT,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, notificationId: string) {
    const notif = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notif) throw new AppError(404, 'Notification not found');
    if (notif.readAt) return notif; // already read

    return prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
      select: NOTIF_SELECT,
    });
  }

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }
}

export const notificationService = new NotificationService();
