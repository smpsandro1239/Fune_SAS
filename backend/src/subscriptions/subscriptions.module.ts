import { Global, Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PlanLimitsService } from './plan-limits.service';
import { BillingService } from './billing.service';

@Global()
@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PlanLimitsService, BillingService],
  exports: [PlanLimitsService, SubscriptionsService, BillingService],
})
export class SubscriptionsModule {}
