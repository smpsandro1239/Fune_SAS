import { Module, forwardRef } from '@nestjs/common';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { PublicationsCronService } from './publications-cron.service';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [forwardRef(() => SocialModule)],
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationsCronService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
