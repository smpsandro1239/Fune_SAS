import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';
import { SubscriptionPlan } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { BillingService } from './billing.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

export class ChangePlanDto {
  @ApiProperty({ enum: ['FREE', 'PRO', 'ENTERPRISE'] })
  @IsEnum(['FREE', 'PRO', 'ENTERPRISE'])
  plan: SubscriptionPlan;
}

@ApiTags('Subscrições')
@UseGuards(RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly billingService: BillingService,
  ) {}

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

  @Get('usage')
  @ApiOperation({ summary: 'Uso atual vs limites do plano efetivo' })
  getUsage(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getUsage(user);
  }

  /**
   * Webhook Stripe — público (Stripe não envia JWT).
   * A assinatura é verificada com STRIPE_WEBHOOK_SECRET sobre o raw body.
   */
  @Public()
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new BadRequestException('STRIPE_WEBHOOK_SECRET não configurado.');
    if (!signature) throw new BadRequestException('Assinatura Stripe em falta.');
    if (!req.rawBody) throw new BadRequestException('Raw body indisponível.');

    let event: Stripe.Event;
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {});
      event = stripe.webhooks.constructEvent(req.rawBody, signature, secret);
    } catch (err) {
      throw new BadRequestException(`Assinatura inválida: ${(err as Error).message}`);
    }

    await this.billingService.handleWebhookEvent(event);
    return { received: true };
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Inicia checkout Stripe para upgrade de plano (apenas ADMIN)' })
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePlanDto) {
    return this.billingService.createCheckoutSession(user, dto.plan);
  }

  @Post('change-plan')
  @ApiOperation({ summary: 'Altera o plano diretamente — fallback demo sem Stripe (apenas ADMIN)' })
  changePlan(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePlanDto) {
    return this.subscriptionsService.changePlan(user, dto.plan);
  }
}
