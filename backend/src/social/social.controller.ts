import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Controller, Get, Post, Param } from '@nestjs/common';
import { SocialService } from './social.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('status')
  @ApiOperation({ summary: 'Estado da integração social da agência (Facebook, Instagram, etc.)' })
  @ApiResponse({ status: 200, description: 'Estado das integrações sociais.' })
  getStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.socialService.getSocialStatus(user.agencyId);
  }

  @Post('publish/:publicationId/:platform')
  @ApiOperation({ summary: 'Publica uma publicação numa plataforma social' })
  @ApiParam({ name: 'publicationId', description: 'ID da publicação' })
  @ApiParam({ name: 'platform', description: 'Plataforma (facebook, instagram)' })
  @ApiResponse({ status: 201, description: 'Publicação enviada.' })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada.' })
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('publicationId') publicationId: string,
    @Param('platform') platform: string,
  ) {
    if (platform === 'facebook')
      return this.socialService.publishToFacebook(user.agencyId, publicationId);
    if (platform === 'instagram')
      return this.socialService.publishToInstagram(user.agencyId, publicationId);
    return this.socialService.publishToFacebook(user.agencyId, publicationId);
  }

  @Post('process-scheduled')
  @ApiOperation({ summary: 'Processa as publicações agendadas pendentes' })
  @ApiResponse({ status: 201, description: 'Publicações agendadas processadas.' })
  processScheduled() {
    return this.socialService.processScheduled();
  }
}
