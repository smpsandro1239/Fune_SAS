import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/document.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';
import { StorageService } from '../storage/storage.service';

export interface DocumentQuery {
  search?: string;
  type?: DocumentType;
  from?: string;
  to?: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planLimits: PlanLimitsService,
    private readonly storage: StorageService,
  ) {}

  findAll(user: AuthenticatedUser, query: DocumentQuery) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    return this.prisma.document.findMany({
      where: {
        agencyId: user.agencyId,
        ...(query.type ? { type: query.type } : {}),
        ...(from || to
          ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
          : {}),
        ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
      },
      include: {
        funeral: {
          select: { id: true, funeralDate: true, deceased: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, agencyId: user.agencyId },
      include: {
        funeral: {
          select: { id: true, funeralDate: true, deceased: { select: { fullName: true } } },
        },
      },
    });
    if (!document) throw new NotFoundException('Documento não encontrado.');
    return document;
  }

  async findByFilename(user: AuthenticatedUser, filename: string) {
    return this.prisma.document.findFirst({
      where: { fileName: filename, agencyId: user.agencyId },
    });
  }

  async create(user: AuthenticatedUser, dto: CreateDocumentDto, file: Express.Multer.File) {
    if (!file || !file.buffer) throw new NotFoundException('Ficheiro em falta.');

    await this.planLimits.assertCanCreateDocument(user.agencyId);

    if (dto.funeralId) {
      const funeral = await this.prisma.funeral.findFirst({
        where: { id: dto.funeralId, agencyId: user.agencyId },
      });
      if (!funeral) throw new NotFoundException('Funeral não encontrado.');
    }

    // Nome único e seguro (ignora o nome original do cliente, que pode conter path traversal)
    const fileName = `${Date.now()}-${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await this.storage.save(fileName, file.buffer, file.mimetype);

    return this.prisma.document.create({
      data: {
        agencyId: user.agencyId,
        funeralId: dto.funeralId,
        title: dto.title,
        type: dto.type,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedById: user.id,
      },
    });
  }

  async remove(user: AuthenticatedUser, id: string) {
    const existing = await this.prisma.document.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!existing) throw new NotFoundException('Documento não encontrado.');
    await this.prisma.document.delete({ where: { id } });

    // Best-effort: apagar também o ficheiro do storage (não falha se já não existir)
    if (existing.fileName) {
      await this.storage.remove(existing.fileName);
    }
    return { success: true };
  }
}
