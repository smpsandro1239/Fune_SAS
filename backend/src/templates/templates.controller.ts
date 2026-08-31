import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FlyerPlan } from '@prisma/client';
import { TemplatesService } from './templates.service';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Templates de Flyer')
@UseGuards(RolesGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os templates de flyer (catálogo global)' })
  @ApiQuery({ name: 'plan', required: false, enum: FlyerPlan })
  @ApiResponse({ status: 200, description: 'Lista de templates de flyer.' })
  findAll(@Query('plan') plan?: FlyerPlan) {
    return this.templatesService.findAll(plan);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um template' })
  @ApiResponse({ status: 200, description: 'Detalhe do template.' })
  @ApiResponse({ status: 404, description: 'Template não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }
}
