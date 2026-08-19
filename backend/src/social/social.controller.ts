import { Controller, Get, Post, Param } from '@nestjs/common';
import { SocialService } from './social.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('status')
  getStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.socialService.getSocialStatus(user.agencyId);
  }

  @Post('publish/:publicationId/:platform')
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('publicationId') publicationId: string,
    @Param('platform') platform: string,
  ) {
    if (platform === 'facebook') return this.socialService.publishToFacebook(user.agencyId, publicationId);
    if (platform === 'instagram') return this.socialService.publishToInstagram(user.agencyId, publicationId);
    return this.socialService.publishToFacebook(user.agencyId, publicationId);
  }

  @Post('process-scheduled')
  processScheduled() {
    return this.socialService.processScheduled();
  }
}
