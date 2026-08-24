import { Module, forwardRef } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { PublicationsModule } from '../publications/publications.module';

@Module({
  imports: [forwardRef(() => PublicationsModule)],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
