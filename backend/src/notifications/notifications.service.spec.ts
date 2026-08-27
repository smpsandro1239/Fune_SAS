import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  const user = { id: 'user-1', agencyId: 'agency-1' };

  beforeEach(async () => {
    prisma = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma notificação de sistema e devolvê-la', async () => {
      const created = {
        id: 'n-1',
        agencyId: 'agency-1',
        userId: null,
        type: 'SISTEMA',
        title: 'Nova condolência',
        message: 'x',
        sentAt: new Date(),
      };
      prisma.notification.create.mockResolvedValue(created);

      const result = await service.create({
        agencyId: 'agency-1',
        title: 'Nova condolência',
        message: 'x',
      });

      expect(result).toEqual(created);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          agencyId: 'agency-1',
          userId: undefined,
          type: 'SISTEMA',
          title: 'Nova condolência',
          message: 'x',
          sentAt: expect.any(Date),
        },
      });
    });

    it('deve suportar userId e tipo customizado', async () => {
      prisma.notification.create.mockResolvedValue({});

      await service.create({
        agencyId: 'agency-1',
        userId: 'user-9',
        type: 'LEMBRETE',
        title: 'T',
        message: 'M',
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          agencyId: 'agency-1',
          userId: 'user-9',
          type: 'LEMBRETE',
          title: 'T',
          message: 'M',
          sentAt: expect.any(Date),
        },
      });
    });

    it('não deve lançar quando o registo falha (evento não bloqueado)', async () => {
      prisma.notification.create.mockRejectedValue(new Error('db down'));

      const result = await service.create({
        agencyId: 'agency-1',
        title: 'T',
        message: 'M',
      });

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('lista as notificações da agência por ordem de envio', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      await service.findAll(user as never);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { agencyId: 'agency-1' },
        orderBy: { sentAt: 'desc' },
        take: 50,
      });
    });

    it('filtra apenas não lidas quando unreadOnly é verdadeiro', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      await service.findAll(user as never, true);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { agencyId: 'agency-1', readAt: null },
        orderBy: { sentAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('markAsRead', () => {
    it('marca como lida uma notificação da agência', async () => {
      prisma.notification.findFirst.mockResolvedValue({ id: 'n-1' });
      prisma.notification.update.mockResolvedValue({ id: 'n-1', readAt: new Date() });

      await service.markAsRead(user as never, 'n-1');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: { readAt: expect.any(Date) },
      });
    });

    it('lança NotFoundException quando a notificação não pertence à agência', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(user as never, 'nope')).rejects.toThrow(NotFoundException);
      expect(prisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('marca todas as não lidas da agência', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(user as never);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { agencyId: 'agency-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
      expect(result).toEqual({ count: 3 });
    });
  });
});
