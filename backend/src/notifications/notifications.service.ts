import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';

export interface CreateNotificationInput {
  agencyId: string;
  userId?: string;
  type?: NotificationType;
  title: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma notificação de sistema para a agência (visível no painel).
   * Não bloqueia eventos críticos — falhas de registo são ignoradas.
   */
  async create({ agencyId, userId, type = 'SISTEMA', title, message }: CreateNotificationInput) {
    try {
      return await this.prisma.notification.create({
        data: { agencyId, userId, type, title, message, sentAt: new Date() },
      });
    } catch {
      // nunca derruba o fluxo que dispara a notificação
      return null;
    }
  }

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
