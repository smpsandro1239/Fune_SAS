import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { CreateAgendaItemDto, UpdateAgendaItemDto } from './dto/agenda-item.dto';

@ApiTags('Agenda')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os itens de agenda da agência (por intervalo de datas)' })
  @ApiQuery({ name: 'from', required: false, description: 'Data inicial (ISO/YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'Data final (ISO/YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Itens de agenda da agência.' })
  findAll(@Request() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    return this.agendaService.findAll(req.user.agencyId, from, to);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um item de agenda' })
  @ApiResponse({ status: 200, description: 'Detalhe do item.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.agendaService.findOne(id, req.user.agencyId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um item de agenda' })
  @ApiResponse({ status: 201, description: 'Item criado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    type: CreateAgendaItemDto,
    examples: {
      exemplo: {
        value: {
          date: '2026-09-01',
          time: '14:00',
          title: 'Reunião com a família',
          description: 'Entregar documentação.',
          color: 'gold',
        },
      },
    },
  })
  create(@Body() body: CreateAgendaItemDto, @Request() req: any) {
    return this.agendaService.create(body, req.user.agencyId, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um item de agenda' })
  @ApiResponse({ status: 200, description: 'Item atualizado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  @ApiBody({
    type: UpdateAgendaItemDto,
    examples: {
      exemplo: {
        value: { title: 'Reunião adiada', time: '15:00' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: UpdateAgendaItemDto, @Request() req: any) {
    return this.agendaService.update(id, body, req.user.agencyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um item de agenda' })
  @ApiResponse({ status: 200, description: 'Item removido.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.agendaService.remove(id, req.user.agencyId);
  }
}
