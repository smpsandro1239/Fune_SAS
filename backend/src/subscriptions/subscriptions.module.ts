import { Global, Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PlanLimitsService } from './plan-limits.service';

@Global()
@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PlanLimitsService],
  exports: [PlanLimitsService, SubscriptionsService],
})
export class SubscriptionsModule {}
