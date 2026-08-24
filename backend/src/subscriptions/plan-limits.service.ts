import { Injectable, ForbiddenException } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LimitExceededException, PLAN_LIMITS } from './plan-limits';

@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Plano efetivo da agência: se a subscrição mais recente expirou,
   * a agência cai automaticamente para as limitações do plano FREE.
   */
  async getEffectivePlan(agencyId: string): Promise<SubscriptionPlan> {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: { subscriptionPlan: true },
    });
    if (!agency) return SubscriptionPlan.FREE;

    const latest = await this.prisma.subscription.findFirst({
      where: { agencyId },
      orderBy: { createdAt: 'desc' },
      select: { plan: true, validUntil: true, status: true },
    });

    // Sem subscrição registada → usa o plano indicado na agência (default FREE)
    if (!latest) return agency.subscriptionPlan;

    const expired = latest.validUntil ? latest.validUntil.getTime() < Date.now() : false;
    const inactive = latest.status && latest.status !== 'ACTIVE';

    return expired || inactive ? SubscriptionPlan.FREE : latest.plan;
  }

  private async assertWithinLimit(
    agencyId: string,
    resource: 'funerals' | 'users' | 'documents',
  ): Promise<void> {
    const plan = await this.getEffectivePlan(agencyId);
    const limits = PLAN_LIMITS[plan];
    const max = limits[`max${resource[0].toUpperCase()}${resource.slice(1)}` as keyof typeof limits];
    if (max < 0) return; // ilimitado

    let count: number;
    switch (resource) {
      case 'funerals':
        count = await this.prisma.funeral.count({ where: { agencyId } });
        break;
      case 'users':
        count = await this.prisma.user.count({ where: { agencyId } });
        break;
      case 'documents':
        count = await this.prisma.document.count({ where: { agencyId } });
        break;
    }

    if (count >= max) {
      throw new ForbiddenException(
        `O seu plano ${plan} permite no máximo ${max} ${resource}. Faça upgrade para adicionar mais.`,
      );
    }
  }

  assertCanCreateFuneral(agencyId: string) {
    return this.assertWithinLimit(agencyId, 'funerals');
  }

  assertCanCreateUser(agencyId: string) {
    return this.assertWithinLimit(agencyId, 'users');
  }

  assertCanCreateDocument(agencyId: string) {
    return this.assertWithinLimit(agencyId, 'documents');
  }
}
