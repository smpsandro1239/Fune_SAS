import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FuneralStatus } from '@prisma/client';
import { FuneralsService } from './funerals.service';
import { CreateFuneralDto, UpdateFuneralDto } from './dto/funeral.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Funerais')
@UseGuards(RolesGuard)
@Controller('funerals')
export class FuneralsController {
  constructor(private readonly funeralsService: FuneralsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os funerais da própria agência com filtros' })
  @ApiQuery({ name: 'search', required: false, description: 'Pesquisa pelo nome do falecido' })
  @ApiQuery({ name: 'status', required: false, enum: FuneralStatus })
  @ApiQuery({ name: 'from', required: false, description: 'Data inicial (ISO)' })
  @ApiQuery({ name: 'to', required: false, description: 'Data final (ISO)' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
    @Query('status') status?: FuneralStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.funeralsService.findAll(user, { search, status, from, to });
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico recente de funerais da agência' })
  history(@CurrentUser() user: AuthenticatedUser) {
    return this.funeralsService.historyByAgency(user);
  }

  // --- Moderação de condolências ---

  @Get('condolences/queue')
  @ApiOperation({ summary: 'Fila de moderação de condolências da agência' })
  @ApiQuery({ name: 'approved', required: false, description: 'Filtra por estado de aprovação (true/false)' })
  condolencesQueue(
    @CurrentUser() user: AuthenticatedUser,
    @Query('approved') approved?: string,
  ) {
    const approvedFilter = approved === 'true' ? true : approved === 'false' ? false : undefined;
    return this.funeralsService.condolencesQueue(user, approvedFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um funeral com documentos' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.funeralsService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo funeral' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFuneralDto) {
    return this.funeralsService.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um funeral' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateFuneralDto) {
    return this.funeralsService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um funeral' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.funeralsService.remove(user, id);
  }

  // --- Moderação de condolências ---

  @Get(':id/condolences')
  @ApiOperation({ summary: 'Lista as condolências de um funeral (inclui pendentes de aprovação)' })
  @ApiQuery({ name: 'approved', required: false, description: 'Filtra por estado de aprovação (true/false)' })
  listCondolences(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('approved') approved?: string,
  ) {
    const approvedFilter = approved === 'true' ? true : approved === 'false' ? false : undefined;
    return this.funeralsService.listCondolences(user, id, approvedFilter);
  }

  @Patch(':id/condolences/:condolenceId/approve')
  @ApiOperation({ summary: 'Aprova uma condolência' })
  approveCondolence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('condolenceId') condolenceId: string,
  ) {
    return this.funeralsService.setCondolenceApproval(user, id, condolenceId, true);
  }

  @Patch(':id/condolences/:condolenceId/reject')
  @ApiOperation({ summary: 'Esconde uma condolência (rejeita)' })
  rejectCondolence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('condolenceId') condolenceId: string,
  ) {
    return this.funeralsService.setCondolenceApproval(user, id, condolenceId, false);
  }

  @Delete(':id/condolences/:condolenceId')
  @ApiOperation({ summary: 'Remove definitivamente uma condolência' })
  removeCondolence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('condolenceId') condolenceId: string,
  ) {
    return this.funeralsService.removeCondolence(user, id, condolenceId);
  }
}
