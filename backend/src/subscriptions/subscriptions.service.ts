import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

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

    const priceCents = plan === 'PRO' ? 2900 : plan === 'ENTERPRISE' ? 9900 : 0;

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
}
