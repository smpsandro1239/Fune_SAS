import { SubscriptionPlan } from '@prisma/client';

export interface PlanLimits {
  maxFunerals: number;
  maxUsers: number;
  maxDocuments: number;
}

/** -1 = ilimitado */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    maxFunerals: 10,
    maxUsers: 1,
    maxDocuments: 25,
  },
  PRO: {
    maxFunerals: 250,
    maxUsers: 8,
    maxDocuments: 500,
  },
  ENTERPRISE: {
    maxFunerals: -1,
    maxUsers: -1,
    maxDocuments: -1,
  },
};

export const PLAN_PRICES_CENTS: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 2900,
  ENTERPRISE: 9900,
};

export class LimitExceededException extends Error {
  constructor(
    public readonly resource: 'funerals' | 'users' | 'documents',
    public readonly limit: number,
    public readonly plan: SubscriptionPlan,
  ) {
    super(`Limite do plano ${plan} atingido para ${resource} (${limit}).`);
    this.name = 'LimitExceededException';
  }
}
