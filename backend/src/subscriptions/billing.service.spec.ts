import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { SubscriptionPlan, UserRole } from '@prisma/client';
import { BillingService } from './billing.service';
import { PLAN_PRICES_CENTS } from './plan-limits';

describe('BillingService', () => {
  let service: BillingService;

  const txMock = {
    subscription: { create: jest.fn().mockResolvedValue({}) },
    agency: { update: jest.fn().mockResolvedValue({}) },
  };

  const prisma = {
    $transaction: jest.fn(async (fn: (tx: typeof txMock) => Promise<void>) => fn(txMock)),
    agency: {
      findUnique: jest.fn().mockResolvedValue({ name: 'Casa Hortas', email: 'geral@test.pt' }),
      update: jest.fn().mockResolvedValue({}),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };

  const admin = () => ({
    id: 'user-1',
    email: 'admin@casahortas.com',
    name: 'Admin',
    role: UserRole.ADMIN,
    agencyId: 'agency-1',
  });
  const member = () => ({ ...admin(), role: UserRole.OPERATOR });

  const stripeCreate = jest.fn();
  const setStripe = (mock: unknown) => {
    (service as unknown as { stripe?: unknown }).stripe = mock;
  };

  const originalKey = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    service = new BillingService(prisma as never);
  });

  afterAll(() => {
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalKey;
  });

  describe('createCheckoutSession', () => {
    it('lança ForbiddenException para utilizador não admin', async () => {
      await expect(service.createCheckoutSession(member(), SubscriptionPlan.PRO)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('downgrade para FREE é imediato e devolve demoMode sem passar por Stripe', async () => {
      const res = await service.createCheckoutSession(admin(), SubscriptionPlan.FREE);

      expect(res).toEqual({ demoMode: true });
      expect(txMock.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agencyId: 'agency-1',
          plan: SubscriptionPlan.FREE,
          status: 'ACTIVE',
          priceCents: 0,
        }),
      });
      expect(txMock.agency.update).toHaveBeenCalledWith({
        where: { id: 'agency-1' },
        data: { subscriptionPlan: SubscriptionPlan.FREE },
      });
    });

    it('devolve demoMode quando STRIPE_SECRET_KEY não está configurada', async () => {
      delete process.env.STRIPE_SECRET_KEY;
      const res = await service.createCheckoutSession(admin(), SubscriptionPlan.PRO);
      expect(res).toEqual({ demoMode: true });
      expect(stripeCreate).not.toHaveBeenCalled();
    });

    it('cria sessão de checkout subscription com preço e metadata corretos', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
      expect(service.configured).toBe(true);
      stripeCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/sess_1' });
      setStripe({ checkout: { sessions: { create: stripeCreate } } });

      const res = await service.createCheckoutSession(admin(), SubscriptionPlan.PRO);

      expect(res).toEqual({ url: 'https://checkout.stripe.com/sess_1' });
      expect(stripeCreate).toHaveBeenCalledTimes(1);
      const arg = stripeCreate.mock.calls[0][0];
      expect(arg.mode).toBe('subscription');
      expect(arg.customer_email).toBe('admin@casahortas.com');
      expect(arg.metadata).toMatchObject({ agencyId: 'agency-1', userId: 'user-1', plan: 'PRO' });
      expect(arg.line_items[0].quantity).toBe(1);
      expect(arg.line_items[0].price_data.currency).toBe('eur');
      expect(arg.line_items[0].price_data.unit_amount).toBe(PLAN_PRICES_CENTS.PRO);
      expect(arg.line_items[0].price_data.recurring).toEqual({ interval: 'month' });
      expect(arg.line_items[0].price_data.product_data.name).toContain('Pro');
      expect(arg.success_url).toContain('/subscriptions?checkout=success');
      expect(arg.cancel_url).toContain('/subscriptions?checkout=cancel');

      setStripe(null);
    });
  });

  describe('handleWebhookEvent — checkout.session.completed', () => {
    const baseEvent = {
      id: 'evt_1',
      type: 'checkout.session.completed' as const,
      data: { object: {} },
    };

    it('ativa o plano pago com os ids Stripe', async () => {
      const event = {
        ...baseEvent,
        data: {
          object: {
            id: 'cs_1',
            client_reference_id: 'agency-1',
            subscription: { id: 'sub_1' },
            customer: 'cus_1',
            metadata: { agencyId: 'agency-1', plan: 'PRO' },
          } as Record<string, unknown>,
        },
      } as never;

      await service.handleWebhookEvent(event);

      expect(txMock.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agencyId: 'agency-1',
          plan: SubscriptionPlan.PRO,
          status: 'ACTIVE',
          priceCents: PLAN_PRICES_CENTS.PRO,
          stripeSessionId: 'cs_1',
          stripeSubscriptionId: 'sub_1',
          stripeCustomerId: 'cus_1',
        }),
      });
      expect(txMock.agency.update).toHaveBeenCalledWith({
        where: { id: 'agency-1' },
        data: { subscriptionPlan: SubscriptionPlan.PRO },
      });
    });

    it('ignora eventos sem agência ou com plano inválido', async () => {
      await service.handleWebhookEvent({
        ...baseEvent,
        data: { object: { id: 'cs_2', metadata: {} } },
      } as never);
      await service.handleWebhookEvent({
        ...baseEvent,
        data: { object: { id: 'cs_3', metadata: { agencyId: 'agency-1' } } },
      } as never);
      await service.handleWebhookEvent({
        ...baseEvent,
        data: { object: { id: 'cs_4', metadata: { agencyId: 'agency-1', plan: 'FREE' } } },
      } as never);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('ignora tipos de evento desconhecidos', async () => {
      await service.handleWebhookEvent({ type: 'payment_intent.succeeded' } as never);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhookEvent — invoice.paid', () => {
    it('renovação cria subscrição nova e mantém o plano na agência', async () => {
      prisma.subscription.findFirst.mockResolvedValueOnce({
        agencyId: 'agency-9',
        plan: SubscriptionPlan.PRO,
        agency: { id: 'agency-9' },
      });

      await service.handleWebhookEvent({
        type: 'invoice.paid',
        data: {
          object: {
            amount_paid: 2900,
            subscription: 'sub_renew',
            customer: 'cus_9',
          },
        },
      } as never);

      expect(prisma.subscription.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeSubscriptionId: 'sub_renew' },
        }),
      );
      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agencyId: 'agency-9',
          plan: SubscriptionPlan.PRO,
          status: 'ACTIVE',
          priceCents: 2900,
          stripeSubscriptionId: 'sub_renew',
          stripeCustomerId: 'cus_9',
        }),
      });
      expect(prisma.agency.update).toHaveBeenCalledWith({
        where: { id: 'agency-9' },
        data: { subscriptionPlan: SubscriptionPlan.PRO },
      });
    });

    it('ignora invoices sem subscription associada ou sem histórico local', async () => {
      await service.handleWebhookEvent({
        type: 'invoice.paid',
        data: { object: { amount_paid: 100 } },
      } as never);
      expect(prisma.subscription.create).not.toHaveBeenCalled();

      prisma.subscription.findFirst.mockResolvedValueOnce(null);
      await service.handleWebhookEvent({
        type: 'invoice.paid',
        data: { object: { amount_paid: 100, subscription: 'sub_unknown' } },
      } as never);
      expect(prisma.subscription.create).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhookEvent — customer.subscription.deleted', () => {
    it('cancela a subscrição e reverte a agência para FREE', async () => {
      prisma.subscription.findFirst.mockResolvedValueOnce({
        agencyId: 'agency-5',
        plan: SubscriptionPlan.ENTERPRISE,
      });

      await service.handleWebhookEvent({
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_cancel' } },
      } as never);

      expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_cancel', status: 'ACTIVE' },
        data: { status: 'CANCELED', validUntil: expect.any(Date) },
      });
      expect(prisma.agency.update).toHaveBeenCalledWith({
        where: { id: 'agency-5' },
        data: { subscriptionPlan: SubscriptionPlan.FREE },
      });
    });

    it('não atualiza a agência se a subscrição cancelada não existe localmente', async () => {
      prisma.subscription.findFirst.mockResolvedValueOnce(null);
      await service.handleWebhookEvent({
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_ghost' } },
      } as never);
      expect(prisma.agency.update).not.toHaveBeenCalled();
    });
  });

  describe('configured / getStripe', () => {
    it('devolve demoMode quando não há chave e getStripe lança BadRequestException', () => {
      expect(service.configured).toBe(false);
      const getStripe = (service as unknown as { getStripe: () => unknown }).getStripe;
      expect(() => getStripe.call(service)).toThrow(BadRequestException);
    });
  });
});
