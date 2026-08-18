import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCondolenceDto } from './dto/condolence.dto';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getFuneralBySlug(agencySlug: string, funeralId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: { id: true, name: true, slug: true, phone: true, email: true, address: true, location: true, website: true },
    });
    if (!agency) throw new NotFoundException('Agência não encontrada.');

    const funeral = await this.prisma.funeral.findFirst({
      where: { id: funeralId, agencyId: agency.id, publicNoticeEnabled: true },
      include: {
        deceased: true,
        condolences: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado ou não público.');

    return { agency, funeral };
  }

  async addCondolence(agencySlug: string, funeralId: string, dto: CreateCondolenceDto) {
    const agency = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: { id: true },
    });
    if (!agency) throw new NotFoundException('Agência não encontrada.');

    const funeral = await this.prisma.funeral.findFirst({
      where: { id: funeralId, agencyId: agency.id, publicNoticeEnabled: true },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado ou não público.');

    return this.prisma.condolence.create({
      data: {
        funeralId,
        authorName: dto.authorName,
        message: dto.message,
      },
    });
  }
}
