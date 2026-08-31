import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { DraftsService } from './drafts.service';

export class CreateDraftDto {
  @ApiProperty({ example: 'Flyer funeral do João' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'elegant' })
  @IsString()
  layoutStyle: string;

  @ApiProperty({ example: { deceasedName: 'João Silva' } })
  data: any;
}

export class UpdateDraftDto {
  @ApiPropertyOptional({ example: 'Flyer funeral do João' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'elegant' })
  @IsOptional()
  @IsString()
  layoutStyle?: string;

  @ApiPropertyOptional({ example: { deceasedName: 'João Silva' } })
  @IsOptional()
  data?: any;
}

@ApiTags('Rascunhos')
@Controller('drafts')
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os rascunhos da própria agência' })
  @ApiResponse({ status: 200, description: 'Lista de rascunhos da agência.' })
  findAll(@Request() req: any) {
    return this.draftsService.findAll(req.user.agencyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um rascunho' })
  @ApiResponse({ status: 200, description: 'Detalhe do rascunho.' })
  @ApiResponse({ status: 404, description: 'Rascunho não encontrado.' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.draftsService.findOne(id, req.user.agencyId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo rascunho' })
  @ApiResponse({ status: 201, description: 'Rascunho criado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    type: CreateDraftDto,
    examples: {
      exemplo: {
        value: {
          name: 'Flyer funeral do João',
          layoutStyle: 'elegant',
          data: { deceasedName: 'João Silva' },
        },
      },
    },
  })
  create(@Body() body: CreateDraftDto, @Request() req: any) {
    return this.draftsService.create(body, req.user.agencyId, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um rascunho' })
  @ApiResponse({ status: 200, description: 'Rascunho atualizado.' })
  @ApiResponse({ status: 404, description: 'Rascunho não encontrado.' })
  @ApiBody({
    type: UpdateDraftDto,
    examples: {
      exemplo: {
        value: {
          name: 'Flyer funeral do João',
          layoutStyle: 'elegant',
          data: { deceasedName: 'João Silva' },
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: UpdateDraftDto, @Request() req: any) {
    return this.draftsService.update(id, body, req.user.agencyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um rascunho' })
  @ApiResponse({ status: 200, description: 'Rascunho removido.' })
  @ApiResponse({ status: 404, description: 'Rascunho não encontrado.' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.draftsService.remove(id, req.user.agencyId);
  }
}
