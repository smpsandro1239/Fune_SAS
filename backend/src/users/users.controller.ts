import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Utilizadores')
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os utilizadores da própria agência' })
  @ApiResponse({ status: 200, description: 'Lista de utilizadores da agência.' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um utilizador da própria agência' })
  @ApiResponse({ status: 200, description: 'Detalhe do utilizador.' })
  @ApiResponse({ status: 404, description: 'Utilizador não encontrado.' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um utilizador na própria agência (apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Utilizador criado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      exemplo: {
        value: {
          name: 'Mariana Silva',
          email: 'mariana@casahortas.com',
          password: 'Password123!',
          role: 'OPERATOR',
        },
      },
    },
  })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um utilizador (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Utilizador atualizado.' })
  @ApiResponse({ status: 404, description: 'Utilizador não encontrado.' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      exemplo: {
        value: {
          name: 'Mariana Silva',
          role: 'OPERATOR',
        },
      },
    },
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um utilizador (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Utilizador removido.' })
  @ApiResponse({ status: 404, description: 'Utilizador não encontrado.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.remove(user, id);
  }
}
