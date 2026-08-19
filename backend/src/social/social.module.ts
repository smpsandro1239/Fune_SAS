import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { PublicationsModule } from '../publications/publications.module';

@Module({
  imports: [PublicationsModule],
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}
