import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentType } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/document.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { RolesGuard } from '../common/guards/roles.guard';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@ApiTags('Documentos')
@UseGuards(RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os documentos da própria agência com pesquisa' })
  @ApiQuery({ name: 'search', required: false, description: 'Pesquisa por título' })
  @ApiQuery({ name: 'type', required: false, enum: DocumentType })
  @ApiQuery({ name: 'from', required: false, description: 'Data inicial (ISO)' })
  @ApiQuery({ name: 'to', required: false, description: 'Data final (ISO)' })
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
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documentsService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Carrega um documento (JPG, PNG, WebP, PDF — máx. 10MB)' })
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
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}-${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|pdf/.test(file.mimetype);
        cb(allowed ? null : new Error('Formato não suportado. Use JPG, PNG, WebP ou PDF.'), allowed);
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
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documentsService.remove(user, id);
  }
}
