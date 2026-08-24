import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole, SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { PLAN_LIMITS, PLAN_PRICES_CENTS, PlanLimits } from './plan-limits';
import { PlanLimitsService } from './plan-limits.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async getCurrent(user: AuthenticatedUser) {
    return this.prisma.subscription.findFirst({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: 'desc' },
      include: { agency: { select: { subscriptionPlan: true } } },
    });
  }

  getHistory(user: AuthenticatedUser) {
    return this.prisma.subscription.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async changePlan(user: AuthenticatedUser, plan: 'FREE' | 'PRO' | 'ENTERPRISE') {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas o administrador pode alterar o plano.');
    }

    const priceCents = PLAN_PRICES_CENTS[plan];

    const subscription = await this.prisma.subscription.create({
      data: {
        agencyId: user.agencyId,
        plan,
        priceCents,
        status: 'ACTIVE',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.agency.update({
      where: { id: user.agencyId },
      data: { subscriptionPlan: plan },
    });

    return subscription;
  }

  /** Uso atual vs limites do plano efetivo (para a UI de subscrição) */
  async getUsage(user: AuthenticatedUser) {
    const effectivePlan = await this.planLimitsService.getEffectivePlan(user.agencyId);
    const limits = PLAN_LIMITS[effectivePlan];

    const [funerals, users, documents] = await Promise.all([
      this.prisma.funeral.count({ where: { agencyId: user.agencyId } }),
      this.prisma.user.count({ where: { agencyId: user.agencyId } }),
      this.prisma.document.count({ where: { agencyId: user.agencyId } }),
    ]);

    const latest = await this.getCurrent(user);

    return {
      plan: effectivePlan,
      expired: latest
        ? !!(latest.validUntil && new Date(latest.validUntil).getTime() < Date.now())
        : false,
      validUntil: latest?.validUntil ?? null,
      usage: { funerals, users, documents },
      limits: {
        maxFunerals: limits.maxFunerals,
        maxUsers: limits.maxUsers,
        maxDocuments: limits.maxDocuments,
      },
      allPlans: Object.fromEntries(
        Object.entries(PLAN_LIMITS).map(([p, l]) => [
          p,
          {
            priceCents: PLAN_PRICES_CENTS[p as SubscriptionPlan],
            ...l,
          } satisfies PlanLimits & { priceCents: number },
        ]),
      ),
    };
  }
}
