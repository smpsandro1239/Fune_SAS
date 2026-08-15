import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Agências')
@UseGuards(RolesGuard)
@Controller('agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Devolve a agência do utilizador autenticado (multi-tenant)' })
  getMyAgency(@CurrentUser() user: AuthenticatedUser) {
    return this.agenciesService.getMyAgency(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza os dados da própria agência (apenas ADMIN)' })
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAgencyDto) {
    return this.agenciesService.update(user, dto);
  }
}
