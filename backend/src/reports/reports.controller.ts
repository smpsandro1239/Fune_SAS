import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  servicesUsage(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.servicesUsage(user, { from, to });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Resumo para o painel inicial da agência' })
  dashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.dashboardSummary(user);
  }
}
