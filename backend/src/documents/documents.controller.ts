import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentType } from '@prisma/client';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/document.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';
import { StorageService } from '../storage/storage.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Extensões permitidas — validadas pelo CONTEÚDO do nome do ficheiro */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

/** Mimetype por extensão (fonte de verdade é a extensão, não o header do cliente) */
const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

@ApiTags('Documentos')
@UseGuards(RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Serve um ficheiro de upload com autenticação.
   * Lê do storage ativo (S3-compatível ou disco local) — apenas utilizadores
   * autenticados da agência dona conseguem aceder.
   */
  @Get('file/:filename')
  @ApiOperation({ summary: 'Descarrega um ficheiro de upload (autenticado)' })
  @ApiResponse({ status: 200, description: 'Conteúdo do ficheiro.' })
  @ApiResponse({ status: 404, description: 'Ficheiro não encontrado.' })
  async serveFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // basename impede path traversal (../../etc/passwd)
    const safeName = filename.split(/[\\/]/).pop()!;
    const ext = extname(safeName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new NotFoundException('Ficheiro não encontrado.');
    }

    // Verificar que o ficheiro pertence a um documento da agência
    const doc = await this.documentsService.findByFilename(user, safeName);
    if (!doc) throw new NotFoundException('Ficheiro não encontrado.');

    res.setHeader('Content-Type', MIME_BY_EXT[ext]);
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (this.storage.configured || !this.storage.existsLocal(safeName)) {
      // Storage remoto (ou ficheiro que já não existe em disco local, ex: após redeploy)
      const buffer = await this.storage.read(safeName);
      res.end(buffer);
      return;
    }
    this.storage.readLocalStream(safeName).pipe(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os documentos da própria agência com pesquisa' })
  @ApiQuery({ name: 'search', required: false, description: 'Pesquisa por título' })
  @ApiQuery({ name: 'type', required: false, enum: DocumentType })
  @ApiQuery({ name: 'from', required: false, description: 'Data inicial (ISO)' })
  @ApiQuery({ name: 'to', required: false, description: 'Data final (ISO)' })
  @ApiResponse({ status: 200, description: 'Lista de documentos da agência.' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
    @Query('type') type?: DocumentType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.documentsService.findAll(user, { search, type, from, to });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um documento' })
  @ApiResponse({ status: 200, description: 'Detalhe do documento.' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documentsService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Carrega um documento (JPG, PNG, WebP, PDF — máx. 10MB)' })
  @ApiResponse({ status: 201, description: 'Documento carregado.' })
  @ApiResponse({ status: 400, description: 'Ficheiro ou dados inválidos.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'title', 'type'],
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        type: { enum: Object.values(DocumentType) },
        funeralId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      // Memória (máx. 10MB) — o StorageService decide se grava em S3 ou disco local
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        // Validar extensão REAL do ficheiro (não confiar no header Content-Type)
        const ext = extname(file.originalname).toLowerCase();
        const extOk = ALLOWED_EXTENSIONS.includes(ext);
        const mimeOk = /jpeg|jpg|png|webp|pdf/.test(file.mimetype);
        cb(
          extOk && mimeOk ? null : new Error('Formato não suportado. Use JPG, PNG, WebP ou PDF.'),
          extOk && mimeOk,
        );
      },
    }),
  )
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.create(user, dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um documento' })
  @ApiResponse({ status: 200, description: 'Documento removido.' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documentsService.remove(user, id);
  }
}
