import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
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
  @ApiParam({ name: 'agencySlug', description: 'Slug da agência' })
  @ApiParam({ name: 'funeralId', description: 'ID do funeral' })
  @ApiResponse({ status: 200, description: 'Dados do funeral e agência.' })
  @ApiResponse({ status: 404, description: 'Funeral não encontrado ou não público.' })
  getFuneral(@Param('agencySlug') agencySlug: string, @Param('funeralId') funeralId: string) {
    return this.publicService.getFuneralBySlug(agencySlug, funeralId);
  }

  @Get(':agencySlug/:funeralId/ical')
  @ApiOperation({
    summary: 'Exporta o funeral em formato iCal (.ics) para adicionar ao calendário',
  })
  @ApiParam({ name: 'agencySlug', description: 'Slug da agência' })
  @ApiParam({ name: 'funeralId', description: 'ID do funeral' })
  @ApiResponse({ status: 200, description: 'Ficheiro .ics do funeral.' })
  @ApiResponse({ status: 404, description: 'Funeral não encontrado ou não público.' })
  async exportIcs(
    @Param('agencySlug') agencySlug: string,
    @Param('funeralId') funeralId: string,
    @Res() res: Response,
  ) {
    const ics = await this.publicService.generateIcs(agencySlug, funeralId);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${funeralId}.ics"`);
    res.send(ics);
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post(':agencySlug/:funeralId/condolences')
  @ApiOperation({ summary: 'Adiciona uma mensagem de condolências ao livro digital' })
  @ApiParam({ name: 'agencySlug', description: 'Slug da agência' })
  @ApiParam({ name: 'funeralId', description: 'ID do funeral' })
  @ApiResponse({ status: 201, description: 'Condolência registada.' })
  @ApiResponse({ status: 404, description: 'Funeral não encontrado.' })
  @ApiBody({
    type: CreateCondolenceDto,
    examples: {
      exemplo: {
        value: {
          authorName: 'Família Silva',
          message: 'Os nossos mais sentidos pêsames.',
        },
      },
    },
  })
  addCondolence(
    @Param('agencySlug') agencySlug: string,
    @Param('funeralId') funeralId: string,
    @Body() dto: CreateCondolenceDto,
  ) {
    return this.publicService.addCondolence(agencySlug, funeralId, dto);
  }
}
