import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Relatórios')
@UseGuards(RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('funerals-per-period')
  @ApiOperation({ summary: 'Número de funerais por período (day, month, year)' })
  @ApiQuery({ name: 'groupBy', enum: ['day', 'month', 'year'], required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiResponse({ status: 200, description: 'Contagem de funerais por período.' })
  funeralsPerPeriod(
    @CurrentUser() user: AuthenticatedUser,
    @Query('groupBy') groupBy: 'day' | 'month' | 'year' = 'month',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.funeralsPerPeriod(user, groupBy, { from, to });
  }

  @Get('services-usage')
  @ApiOperation({ summary: 'Tipos de serviços mais utilizados' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiResponse({ status: 200, description: 'Uso de tipos de serviço.' })
  servicesUsage(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.servicesUsage(user, { from, to });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Resumo para o painel inicial da agência' })
  @ApiResponse({ status: 200, description: 'Resumo do painel.' })
  dashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.dashboardSummary(user);
  }

  @Get('export')
  @ApiOperation({ summary: 'Exporta todos os funerais da agência em CSV (download Excel-PT)' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiResponse({ status: 200, description: 'Ficheiro CSV gerado.' })
  export(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.exportFunerals(user, { from, to });
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Exporta todos os funerais da agência em PDF (relatório)' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiResponse({ status: 200, description: 'Ficheiro PDF gerado.' })
  async exportPdf(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const pdf = await this.reportsService.exportPdf(user, { from, to });
    res.set({
      'Content-Type': pdf.contentType,
      'Content-Disposition': `attachment; filename="${pdf.filename}"`,
      'Content-Length': pdf.content.length,
    });
    res.send(Buffer.from(pdf.content));
  }
}
