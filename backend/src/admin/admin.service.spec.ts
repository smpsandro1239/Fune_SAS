import { NotFoundException } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { AdminService } from './admin.service';
import { PLAN_PRICES_CENTS } from '../subscriptions/plan-limits';

describe('AdminService', () => {
  let service: AdminService;

  const prisma = {
    agency: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: { count: jest.fn(), findMany: jest.fn() },
    funeral: { count: jest.fn() },
    subscription: { count: jest.fn(), create: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService(prisma as never);
  });

  describe('overview', () => {
    it('calcula métricas globais e a receita estimada', async () => {
      prisma.agency.count.mockResolvedValue(2);
      prisma.user.count.mockResolvedValue(5);
      prisma.funeral.count.mockResolvedValue(12);
      prisma.subscription.count.mockResolvedValue(2);
      prisma.agency.findMany.mockResolvedValue([
        { subscriptionPlan: SubscriptionPlan.FREE },
        { subscriptionPlan: SubscriptionPlan.ENTERPRISE },
      ]);

      const result = await service.overview();

      expect(result).toEqual({
        totalAgencies: 2,
        totalUsers: 5,
        totalFunerals: 12,
        activeSubscriptions: 2,
        revenueEstimate: 99,
      });
    });
  });

  describe('agencies', () => {
    it('mapeia as agências com a contagem de utilizadores', async () => {
      prisma.agency.findMany.mockResolvedValue([
        {
          id: 'agency-1',
          name: 'Casa Hortas',
          slug: 'casahortas',
          location: 'Braga',
          subscriptionPlan: SubscriptionPlan.PRO,
          createdAt: new Date(),
          _count: { users: 3 },
        },
      ]);

      const result = await service.agencies();

      expect(result[0].usersCount).toBe(3);
      expect(result[0].subscriptionPlan).toBe(SubscriptionPlan.PRO);
    });
  });

  describe('setAgencyPlan', () => {
    it('lança NotFoundException quando a agência não existe', async () => {
      prisma.agency.findUnique.mockResolvedValue(null);

      await expect(service.setAgencyPlan('agency-ghost', SubscriptionPlan.PRO)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.subscription.create).not.toHaveBeenCalled();
    });

    it('cria uma subscrição ativa e atualiza o plano da agência', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        id: 'agency-1',
        name: 'Casa Hortas',
      });
      prisma.subscription.create.mockResolvedValue({ id: 'sub-1' });
      prisma.agency.update.mockResolvedValue({ id: 'agency-1' });

      const result = await service.setAgencyPlan('agency-1', SubscriptionPlan.ENTERPRISE);

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agencyId: 'agency-1',
          plan: SubscriptionPlan.ENTERPRISE,
          status: 'ACTIVE',
          priceCents: PLAN_PRICES_CENTS.ENTERPRISE,
          validUntil: expect.any(Date),
        }),
      });
      expect(prisma.agency.update).toHaveBeenCalledWith({
        where: { id: 'agency-1' },
        data: { subscriptionPlan: SubscriptionPlan.ENTERPRISE },
      });
      expect(result.agency).toEqual({
        id: 'agency-1',
        name: 'Casa Hortas',
        subscriptionPlan: SubscriptionPlan.ENTERPRISE,
      });
    });

    it('usa preço 0 para o plano FREE', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', name: 'Teste' });
      prisma.subscription.create.mockResolvedValue({ id: 'sub-2' });
      prisma.agency.update.mockResolvedValue({ id: 'agency-1' });

      await service.setAgencyPlan('agency-1', SubscriptionPlan.FREE);

      expect(prisma.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priceCents: 0, plan: SubscriptionPlan.FREE }),
        }),
      );
    });
  });
});
