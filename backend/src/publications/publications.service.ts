import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicationDto, UpdatePublicationDto } from './dto/publication.dto';

@Injectable()
export class PublicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(agencyId: string, status?: string) {
    return this.prisma.publication.findMany({
      where: {
        agencyId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        funeral: { select: { id: true, funeralDate: true, deceased: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(agencyId: string, id: string) {
    const pub = await this.prisma.publication.findFirst({
      where: { id, agencyId },
      include: {
        funeral: { select: { id: true, funeralDate: true, deceased: { select: { fullName: true } } } },
      },
    });
    if (!pub) throw new NotFoundException('Publicação não encontrada.');
    return pub;
  }

  async create(agencyId: string, userId: string, dto: CreatePublicationDto) {
    if (dto.funeralId) {
      const funeral = await this.prisma.funeral.findFirst({
        where: { id: dto.funeralId, agencyId },
      });
      if (!funeral) throw new NotFoundException('Funeral não encontrado.');
    }

    return this.prisma.publication.create({
      data: {
        agencyId,
        funeralId: dto.funeralId,
        title: dto.title,
        caption: dto.caption,
        platform: dto.platform as any,
        imageUrl: dto.imageUrl,
        imageBase64: dto.imageBase64,
        status: dto.scheduledFor ? 'SCHEDULED' : 'DRAFT',
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      },
    });
  }

  async update(agencyId: string, id: string, dto: UpdatePublicationDto) {
    const existing = await this.prisma.publication.findFirst({ where: { id, agencyId } });
    if (!existing) throw new NotFoundException('Publicação não encontrada.');

    if (dto.status && !['DRAFT', 'SCHEDULED', 'CANCELED'].includes(dto.status)) {
      throw new BadRequestException('Só é possível alterar para DRAFT, SCHEDULED ou CANCELED.');
    }

    return this.prisma.publication.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.caption !== undefined && { caption: dto.caption }),
        ...(dto.scheduledFor !== undefined && { scheduledFor: new Date(dto.scheduledFor) }),
        ...(dto.status !== undefined && { status: dto.status as any }),
      },
    });
  }

  async remove(agencyId: string, id: string) {
    const existing = await this.prisma.publication.findFirst({ where: { id, agencyId } });
    if (!existing) throw new NotFoundException('Publicação não encontrada.');
    await this.prisma.publication.delete({ where: { id } });
    return { success: true };
  }

  async getUpcoming(agencyId: string) {
    return this.prisma.publication.findMany({
      where: {
        agencyId,
        status: 'SCHEDULED',
        scheduledFor: { gte: new Date() },
      },
      include: {
        funeral: { select: { id: true, funeralDate: true, deceased: { select: { fullName: true } } } },
      },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async getScheduledForCron() {
    return this.prisma.publication.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: new Date() },
      },
      include: {
        agency: { select: { id: true, name: true } },
        funeral: { select: { id: true, deceased: { select: { fullName: true } } } },
      },
    });
  }

  async markPublished(id: string, externalPostId: string) {
    return this.prisma.publication.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date(), externalPostId },
    });
  }

  async markFailed(id: string, errorMessage: string) {
    return this.prisma.publication.update({
      where: { id },
      data: { status: 'FAILED', errorMessage },
    });
  }
}
