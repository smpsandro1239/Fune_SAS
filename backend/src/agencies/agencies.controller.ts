import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
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
  @ApiResponse({ status: 200, description: 'Dados da agência.' })
  getMyAgency(@CurrentUser() user: AuthenticatedUser) {
    return this.agenciesService.getMyAgency(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza os dados da própria agência (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Agência atualizada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    type: UpdateAgencyDto,
    examples: {
      exemplo: {
        value: {
          name: 'Funerária Casa Hortas, Lda',
          phone: '+351 253 123 456',
          email: 'geral@casahortas.com',
          address: 'Rua das Maceirinhas, Cabreiros, Braga',
          location: 'Ventosa, Vieira do Minho',
          foundedYear: 'DESDE 1890',
          website: 'www.casahortas.com',
          condolenceModeration: true,
        },
      },
    },
  })
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAgencyDto) {
    return this.agenciesService.update(user, dto);
  }

  @Post('me/whatsapp/test')
  @ApiOperation({
    summary: 'Envia uma mensagem de teste WhatsApp para validar a configuração (apenas ADMIN)',
  })
  @ApiResponse({ status: 201, description: 'Mensagem de teste enviada.' })
  testWhatsApp(@CurrentUser() user: AuthenticatedUser) {
    return this.agenciesService.testWhatsApp(user);
  }
}
