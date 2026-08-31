import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Controller, Post, Body, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsGeneratorService, DocType } from './documents-generator.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';

const VALID_TYPES: DocType[] = [
  'PRESENCA',
  'PROGRAMA',
  'CREMACAO',
  'TRANSPORTE_DOCS',
  'RELATORIO',
  'SEPULTURA',
  'CONDOLENCIA',
  'ATESTADO_OBITO',
  'AUTORIZACAO_SEPULTAMENTO',
  'CONTRATO_SERVICO',
  'GUIA_PAGAMENTO',
  'DECLARACAO_HERDEIROS',
  'ORCAMENTO',
  'AUTORIZACAO_TRANSPORTE',
];

@ApiTags('Gerador de Documentos')
@Controller('documents')
export class DocumentsGeneratorController {
  constructor(private readonly generatorService: DocumentsGeneratorService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Gera um documento PDF (certidão de óbito, orçamento, etc.)' })
  @ApiResponse({ status: 201, description: 'Ficheiro PDF devolvido.' })
  @ApiResponse({ status: 400, description: 'funeralId ou type ausentes, ou tipo inválido.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['funeralId', 'type'],
      properties: {
        funeralId: { type: 'string', example: 'clx...' },
        type: {
          type: 'string',
          enum: VALID_TYPES,
          example: 'ATESTADO_OBITO',
        },
        copies: { type: 'number', example: 2 },
        extraData: {
          type: 'object',
          example: { deceasedName: 'João Silva' },
        },
      },
    },
  })
  async generate(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: { funeralId: string; type: string; extraData?: Record<string, any>; copies?: number },
    @Res() res: Response,
  ) {
    if (!body.funeralId || !body.type) {
      throw new BadRequestException('funeralId e type são obrigatórios.');
    }

    const type = body.type.toUpperCase() as DocType;
    if (!VALID_TYPES.includes(type)) {
      throw new BadRequestException(`Tipo inválido. Use: ${VALID_TYPES.join(', ')}`);
    }

    const buffer = await this.generatorService.generate(
      user.agencyId,
      body.funeralId,
      type,
      body.extraData,
      body.copies,
    );
    const filename = this.generatorService.getFilename(
      type,
      body.extraData?.deceasedName || 'documento',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
