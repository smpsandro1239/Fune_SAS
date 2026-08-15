import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Patch, Post, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Notificações')
@UseGuards(RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as notificações da agência' })
  @ApiQuery({ name: 'unread', required: false, description: 'Apenas não lidas' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('unread') unread?: string) {
    return this.notificationsService.findAll(user, unread === 'true');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  markAsRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marca todas as notificações como lidas' })
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user);
  }
}
