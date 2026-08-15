import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

export class ChangePlanDto {
  plan: SubscriptionPlan;
}

@ApiTags('Subscrições')
@UseGuards(RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Plano atual da agência' })
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getCurrent(user);
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de subscrições da agência' })
  getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getHistory(user);
  }

  @Post('change-plan')
  @ApiOperation({ summary: 'Altera o plano da agência (apenas ADMIN)' })
  changePlan(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePlanDto) {
    return this.subscriptionsService.changePlan(user, dto.plan);
  }
}
