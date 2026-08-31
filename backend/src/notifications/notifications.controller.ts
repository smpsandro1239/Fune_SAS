import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Patch, Post, Param, Query, UseGuards, Sse, Req } from '@nestjs/common';
import { Request } from 'express';
import { interval, merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { SseAuthGuard } from './sse-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { Public } from '../common/decorators/public.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Notificações')
@UseGuards(RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista as notificações da agência' })
  @ApiQuery({ name: 'unread', required: false, description: 'Apenas não lidas' })
  @ApiResponse({ status: 200, description: 'Lista de notificações.' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('unread') unread?: string) {
    return this.notificationsService.findAll(user, unread === 'true');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida.' })
  markAsRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marca todas as notificações como lidas' })
  @ApiResponse({ status: 201, description: 'Todas as notificações marcadas como lidas.' })
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Sse('stream')
  @Public()
  @UseGuards(SseAuthGuard)
  @ApiOperation({ summary: 'Stream em tempo real (SSE) das notificações da agência' })
  stream(@Req() req: Request): Observable<{ data: unknown }> {
    const user = (req as unknown as { user?: AuthenticatedUser }).user!;
    const agencyId = user.agencyId;
    const initial = of({ data: { type: 'connected', message: 'stream pronto' } });

    const heartbeats = interval(25000).pipe(map(() => ({ data: { type: 'ping' } })));

    const realtime = new Observable<{ data: unknown }>((subscriber) => {
      const subscription = this.gateway.onNotification(agencyId, (notification) => {
        subscriber.next({
          data: { type: 'notification', notification },
        });
      });
      return () => subscription.unsubscribe();
    });

    return merge(initial, realtime, heartbeats);
  }
}
