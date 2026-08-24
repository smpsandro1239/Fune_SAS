import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { PublicModule } from './public/public.module';
import { DraftsModule } from './drafts/drafts.module';
import { DocumentsGeneratorModule } from './documents-generator/documents-generator.module';
import { PublicationsModule } from './publications/publications.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    // Rate limit global: 100 pedidos / minuto por IP.
    // Endpoints sensíveis (login, reset, condolências) têm limites próprios via @Throttle().
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
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
    PublicModule,
    DraftsModule,
    DocumentsGeneratorModule,
    PublicationsModule,
    SocialModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
