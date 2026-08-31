import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DeceasedService } from './deceased.service';
import { CreateDeceasedDto, UpdateDeceasedDto } from './dto/deceased.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Falecidos')
@UseGuards(RolesGuard)
@Controller('deceased')
export class DeceasedController {
  constructor(private readonly deceasedService: DeceasedService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os falecidos da própria agência' })
  @ApiQuery({ name: 'search', required: false, description: 'Pesquisa por nome' })
  @ApiResponse({ status: 200, description: 'Lista de falecidos da agência.' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('search') search?: string) {
    return this.deceasedService.findAll(user, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um falecido com histórico de funerais' })
  @ApiResponse({ status: 200, description: 'Detalhe do falecido.' })
  @ApiResponse({ status: 404, description: 'Falecido não encontrado.' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.deceasedService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Regista um novo falecido' })
  @ApiResponse({ status: 201, description: 'Falecido registado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    type: CreateDeceasedDto,
    examples: {
      exemplo: {
        value: {
          fullName: 'LUÍS FILIPE DA SILVA FREITAS',
          age: 27,
          dateOfBirth: '1999-03-14T00:00:00.000Z',
          dateOfDeath: '2026-07-08T09:00:00.000Z',
          placeOfDeath: 'Hospital de Braga',
          photoUrl: 'https://cdn.exemplo.pt/foto.jpg',
        },
      },
    },
  })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDeceasedDto) {
    return this.deceasedService.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um falecido' })
  @ApiResponse({ status: 200, description: 'Falecido atualizado.' })
  @ApiResponse({ status: 404, description: 'Falecido não encontrado.' })
  @ApiBody({
    type: UpdateDeceasedDto,
    examples: {
      exemplo: {
        value: {
          fullName: 'LUÍS FILIPE DA SILVA FREITAS',
          age: 28,
          placeOfDeath: 'Hospital de Braga',
        },
      },
    },
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDeceasedDto,
  ) {
    return this.deceasedService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um falecido' })
  @ApiResponse({ status: 200, description: 'Falecido removido.' })
  @ApiResponse({ status: 404, description: 'Falecido não encontrado.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.deceasedService.remove(user, id);
  }
}
