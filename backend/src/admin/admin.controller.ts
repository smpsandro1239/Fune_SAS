import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Administração')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Estatísticas globais (apenas Super Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Contagens globais: agências, utilizadores, funerais e receita estimada.',
  })
  @ApiResponse({ status: 403, description: 'Permissões insuficientes.' })
  overview() {
    return this.adminService.overview();
  }

  @Get('agencies')
  @ApiOperation({
    summary: 'Lista todas as agências com contagem de utilizadores (apenas Super Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agências com utilizadores e plano de subscrição.',
  })
  @ApiResponse({ status: 403, description: 'Permissões insuficientes.' })
  agencies() {
    return this.adminService.agencies();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Lista todos os utilizadores com a respetiva agência (apenas Super Admin)',
  })
  @ApiResponse({ status: 200, description: 'Lista de utilizadores com agência e plano.' })
  @ApiResponse({ status: 403, description: 'Permissões insuficientes.' })
  users() {
    return this.adminService.users();
  }
}
