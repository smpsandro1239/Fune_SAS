import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('search') search?: string) {
    return this.deceasedService.findAll(user, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um falecido com histórico de funerais' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.deceasedService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Regista um novo falecido' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDeceasedDto) {
    return this.deceasedService.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um falecido' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDeceasedDto,
  ) {
    return this.deceasedService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um falecido' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.deceasedService.remove(user, id);
  }
}
