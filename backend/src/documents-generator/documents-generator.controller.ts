import { Controller, Post, Body, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsGeneratorService, DocType } from './documents-generator.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';

const VALID_TYPES: DocType[] = ['PRESENCA', 'PROGRAMA', 'CREMACAO', 'TRANSPORTE_DOCS', 'RELATORIO', 'SEPULTURA', 'CONDOLENCIA'];

@Controller('documents')
export class DocumentsGeneratorController {
  constructor(private readonly generatorService: DocumentsGeneratorService) {}

  @Post('generate')
  async generate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { funeralId: string; type: string; extraData?: Record<string, any> },
    @Res() res: Response,
  ) {
    if (!body.funeralId || !body.type) {
      throw new BadRequestException('funeralId e type são obrigatórios.');
    }

    const type = body.type.toUpperCase() as DocType;
    if (!VALID_TYPES.includes(type)) {
      throw new BadRequestException(`Tipo inválido. Use: ${VALID_TYPES.join(', ')}`);
    }

    const buffer = await this.generatorService.generate(user.agencyId, body.funeralId, type, body.extraData);
    const filename = this.generatorService.getFilename(type, body.extraData?.deceasedName || 'documento');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
