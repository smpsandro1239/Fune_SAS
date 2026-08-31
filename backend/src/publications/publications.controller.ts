import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto, UpdatePublicationDto } from './dto/publication.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@ApiTags('Publicações')
@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as publicações da agência' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtra por estado' })
  @ApiResponse({ status: 200, description: 'Lista de publicações.' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: string) {
    return this.publicationsService.findAll(user.agencyId, status);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Publicações agendadas para breve' })
  @ApiResponse({ status: 200, description: 'Lista de publicações agendadas.' })
  getUpcoming(@CurrentUser() user: AuthenticatedUser) {
    return this.publicationsService.getUpcoming(user.agencyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma publicação' })
  @ApiParam({ name: 'id', description: 'ID da publicação' })
  @ApiResponse({ status: 200, description: 'Detalhe da publicação.' })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada.' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.publicationsService.findOne(user.agencyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova publicação' })
  @ApiResponse({ status: 201, description: 'Publicação criada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    type: CreatePublicationDto,
    examples: {
      exemplo: {
        value: {
          title: 'Falecimento de João Silva',
          caption: 'Com grande pesar...',
          platform: 'FACEBOOK',
          funeralId: 'clx...',
          imageUrl: 'https://cdn.exemplo.pt/flyer.jpg',
          scheduledFor: '2026-07-08T17:00:00.000Z',
        },
      },
    },
  })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePublicationDto) {
    return this.publicationsService.create(user.agencyId, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma publicação' })
  @ApiParam({ name: 'id', description: 'ID da publicação' })
  @ApiResponse({ status: 200, description: 'Publicação atualizada.' })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada.' })
  @ApiBody({
    type: UpdatePublicationDto,
    examples: {
      exemplo: {
        value: {
          title: 'Falecimento de João Silva',
          caption: 'Com grande pesar...',
          scheduledFor: '2026-07-08T18:00:00.000Z',
          status: 'SCHEDULED',
        },
      },
    },
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePublicationDto,
  ) {
    return this.publicationsService.update(user.agencyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma publicação' })
  @ApiParam({ name: 'id', description: 'ID da publicação' })
  @ApiResponse({ status: 200, description: 'Publicação removida.' })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.publicationsService.remove(user.agencyId, id);
  }
}
