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
}
