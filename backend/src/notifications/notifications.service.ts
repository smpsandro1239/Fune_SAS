import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: AuthenticatedUser, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        agencyId: user.agencyId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(user: AuthenticatedUser, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!notification) throw new NotFoundException('Notificação não encontrada.');
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  markAllAsRead(user: AuthenticatedUser) {
    return this.prisma.notification.updateMany({
      where: { agencyId: user.agencyId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
