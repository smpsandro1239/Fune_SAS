import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AgenciesModule } from './agencies/agencies.module';
import { UsersModule } from './users/users.module';
import { DeceasedModule } from './deceased/deceased.module';
import { FuneralsModule } from './funerals/funerals.module';
import { DocumentsModule } from './documents/documents.module';
import { TemplatesModule } from './templates/templates.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AgenciesModule,
    UsersModule,
    DeceasedModule,
    FuneralsModule,
    DocumentsModule,
    TemplatesModule,
    ReportsModule,
    NotificationsModule,
    SubscriptionsModule,
    HealthModule,
  ],
})
export class AppModule {}
