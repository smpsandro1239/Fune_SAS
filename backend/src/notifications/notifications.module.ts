import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { SseAuthGuard } from './sse-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [NotificationsService, NotificationsGateway, SseAuthGuard],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
