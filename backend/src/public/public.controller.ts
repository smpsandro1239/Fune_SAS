import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PublicService } from './public.service';
import { CreateCondolenceDto } from './dto/condolence.dto';

@ApiTags('Público')
@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':agencySlug/:funeralId')
  @ApiOperation({ summary: 'Dados públicos do funeral (participação de falecimento)' })
  @ApiResponse({ status: 200, description: 'Dados do funeral e agência.' })
  @ApiResponse({ status: 404, description: 'Funeral não encontrado ou não público.' })
  getFuneral(
    @Param('agencySlug') agencySlug: string,
    @Param('funeralId') funeralId: string,
  ) {
    return this.publicService.getFuneralBySlug(agencySlug, funeralId);
  }

  @Post(':agencySlug/:funeralId/condolences')
  @ApiOperation({ summary: 'Adiciona uma mensagem de condolências ao livro digital' })
  @ApiResponse({ status: 201, description: 'Condolência registada.' })
  @ApiResponse({ status: 404, description: 'Funeral não encontrado.' })
  addCondolence(
    @Param('agencySlug') agencySlug: string,
    @Param('funeralId') funeralId: string,
    @Body() dto: CreateCondolenceDto,
  ) {
    return this.publicService.addCondolence(agencySlug, funeralId, dto);
  }
}
