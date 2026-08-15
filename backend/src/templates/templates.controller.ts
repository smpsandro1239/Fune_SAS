import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  findAll(@Query('plan') plan?: FlyerPlan) {
    return this.templatesService.findAll(plan);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um template' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }
}
