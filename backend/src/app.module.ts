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
import { PublicModule } from './public/public.module';
import { DraftsModule } from './drafts/drafts.module';
import { DocumentsGeneratorModule } from './documents-generator/documents-generator.module';
import { PublicationsModule } from './publications/publications.module';
import { SocialModule } from './social/social.module';

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
    PublicModule,
    DraftsModule,
    DocumentsGeneratorModule,
    PublicationsModule,
    SocialModule,
  ],
})
export class AppModule {}
