import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto, UpdatePublicationDto } from './dto/publication.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: string) {
    return this.publicationsService.findAll(user.agencyId, status);
  }

  @Get('upcoming')
  getUpcoming(@CurrentUser() user: AuthenticatedUser) {
    return this.publicationsService.getUpcoming(user.agencyId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.publicationsService.findOne(user.agencyId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePublicationDto) {
    return this.publicationsService.create(user.agencyId, user.id, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdatePublicationDto) {
    return this.publicationsService.update(user.agencyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.publicationsService.remove(user.agencyId, id);
  }
}
