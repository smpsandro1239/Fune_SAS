import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionPlan, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { PLAN_LIMITS, PLAN_PRICES_CENTS } from './plan-limits';

const PAID_PLANS: SubscriptionPlan[] = [SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE];
/** Duração do ciclo em dias */
const CYCLE_DAYS = 30;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly prisma: PrismaService) {}

  get configured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  private getStripe(): Stripe {
    if (!this.stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new BadRequestException('Stripe não está configurado (STRIPE_SECRET_KEY).');
      this.stripe = new Stripe(key);
    }
    return this.stripe;
  }

  private appUrl(): string {
    return process.env.APP_URL || 'https://fune-sas.vercel.app';
  }

  /** Cria uma sessão de Checkout para upgrade de plano. Devolve null se Stripe não estiver configurado. */
  async createCheckoutSession(
    user: AuthenticatedUser,
    plan: SubscriptionPlan,
  ): Promise<{ url?: string; demoMode?: boolean }> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas o administrador pode alterar a subscrição.');
    }
    if (!PAID_PLANS.includes(plan)) {
      // Downgrade para FREE é imediato e não passa por pagamento
      await this.activatePlan(user.agencyId, plan, null);
      return { demoMode: true };
    }

    if (!this.configured) {
      this.logger.warn('Checkout pedido mas STRIPE_SECRET_KEY não configurada — modo demo.');
      return { demoMode: true };
    }

    const stripe = this.getStripe();
    const agency = await this.prisma.agency.findUnique({
      where: { id: user.agencyId },
      select: { name: true, email: true },
    });

    const priceCents = PLAN_PRICES_CENTS[plan];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: user.agencyId,
      metadata: { agencyId: user.agencyId, userId: user.id, plan },
      subscription_data: {
        metadata: { agencyId: user.agencyId, plan },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: priceCents,
            recurring: { interval: 'month' },
            product_data: {
              name: `Fune_SAS ${plan === 'PRO' ? 'Pro' : 'Enterprise'} — ${agency?.name ?? user.agencyId}`,
              description:
                plan === SubscriptionPlan.PRO
                  ? `${PLAN_LIMITS.PRO.maxFunerals} funerais · ${PLAN_LIMITS.PRO.maxUsers} utilizadores · ${PLAN_LIMITS.PRO.maxDocuments} documentos`
                  : 'Funerais, utilizadores e documentos ilimitados · API completa · Manager dedicado',
            },
          },
        },
      ],
      success_url: `${this.appUrl()}/subscriptions?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.appUrl()}/subscriptions?checkout=cancel`,
    });

    return { url: session.url ?? undefined };
  }

  /**
   * Processa eventos do webhook Stripe.
   * Lança apenas erros de assinatura inválida (o controller devolve 400).
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.paid':
        await this.onInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const agencyId = session.metadata?.agencyId || session.client_reference_id;
    const plan = (session.metadata?.plan as SubscriptionPlan) || null;

    if (!agencyId || !plan || !PAID_PLANS.includes(plan)) return;

    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;

    await this.activatePlan(agencyId, plan, {
      stripeSessionId: session.id,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
    });
    this.logger.log(`Stripe: plano ${plan} ativado para agência ${agencyId}.`);
  }

  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    // Em versões recentes da API Stripe o campo subscription já não faz parte do tipo Invoice
    const rawSub = (invoice as unknown as { subscription?: string | { id?: string } }).subscription;
    const subscriptionId = typeof rawSub === 'string' ? rawSub : rawSub?.id ?? null;
    if (!subscriptionId) return;

    // Renovação: encontrar a subscrição anterior da agência
    const previous = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      orderBy: { createdAt: 'desc' },
      include: { agency: { select: { id: true } } },
    });
    if (!previous) return;

    await this.prisma.subscription.create({
      data: {
        agencyId: previous.agencyId,
        plan: previous.plan,
        status: 'ACTIVE',
        priceCents: invoice.amount_paid,
        validUntil: new Date(Date.now() + CYCLE_DAYS * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId:
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null,
      },
    });
    await this.prisma.agency.update({
      where: { id: previous.agencyId },
      data: { subscriptionPlan: previous.plan },
    });
    this.logger.log(`Stripe: renovação registada para agência ${previous.agencyId}.`);
  }

  private async onSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id, status: 'ACTIVE' },
      data: { status: 'CANCELED', validUntil: new Date() },
    });

    const latest = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) return;

    await this.prisma.agency.update({
      where: { id: latest.agencyId },
      data: { subscriptionPlan: SubscriptionPlan.FREE },
    });
    this.logger.log(`Stripe: subscrição cancelada — agência ${latest.agencyId} revertida para FREE.`);
  }

  private async activatePlan(
    agencyId: string,
    plan: SubscriptionPlan,
    stripeIds: {
      stripeSessionId?: string | null;
      stripeSubscriptionId?: string | null;
      stripeCustomerId?: string | null;
    } | null,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.create({
        data: {
          agencyId,
          plan,
          status: 'ACTIVE',
          priceCents: PLAN_PRICES_CENTS[plan],
          validUntil: new Date(Date.now() + CYCLE_DAYS * 24 * 60 * 60 * 1000),
          ...(stripeIds ?? {}),
        },
      });
      await tx.agency.update({
        where: { id: agencyId },
        data: { subscriptionPlan: plan },
      });
    });
  }
}
