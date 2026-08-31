import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

export const ADMIN_PLAN_PRICES: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 29,
  ENTERPRISE: 99,
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [totalAgencies, totalUsers, totalFunerals, activeSubscriptions, agencies] =
      await Promise.all([
        this.prisma.agency.count(),
        this.prisma.user.count(),
        this.prisma.funeral.count(),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        this.prisma.agency.findMany({
          select: { subscriptionPlan: true },
        }),
      ]);

    const revenueEstimate = agencies.reduce(
      (sum, agency) => sum + (ADMIN_PLAN_PRICES[agency.subscriptionPlan] ?? 0),
      0,
    );

    return {
      totalAgencies,
      totalUsers,
      totalFunerals,
      activeSubscriptions,
      revenueEstimate,
    };
  }

  async agencies() {
    const agencies = await this.prisma.agency.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        subscriptionPlan: true,
        createdAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    return agencies.map((agency) => ({
      id: agency.id,
      name: agency.name,
      slug: agency.slug,
      location: agency.location,
      subscriptionPlan: agency.subscriptionPlan,
      createdAt: agency.createdAt,
      usersCount: agency._count.users,
    }));
  }

  async users() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        agency: {
          select: { id: true, name: true, subscriptionPlan: true },
        },
      },
    });

    return users;
  }
}
