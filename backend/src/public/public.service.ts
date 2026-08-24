import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCondolenceDto } from './dto/condolence.dto';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getFuneralBySlug(agencySlug: string, funeralId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: {
        id: true, name: true, slug: true, phone: true,
        email: true, address: true, location: true, website: true,
        logoUrl: true, foundedYear: true,
      },
    });
    if (!agency) throw new NotFoundException('Agência não encontrada.');

    const funeral = await this.prisma.funeral.findFirst({
      where: { id: funeralId, agencyId: agency.id, publicNoticeEnabled: true },
      select: {
        id: true,
        funeralDate: true,
        funeralTime: true,
        locationParish: true,
        cemeteryLocation: true,
        wakeDate: true,
        wakeTime: true,
        wakeLocation: true,
        serviceType: true,
        deceased: {
          select: {
            fullName: true,
            age: true,
            photoUrl: true,
            dateOfDeath: true,
          },
        },
        condolences: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            authorName: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado ou não público.');

    return { agency, funeral };
  }

  async addCondolence(agencySlug: string, funeralId: string, dto: CreateCondolenceDto) {
    // Honeypot anti-spam: bots preenchem todos os campos
    if (dto.website) {
      return { success: true, message: 'Condolência registada.' };
    }

    const agency = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: { id: true, condolenceModeration: true },
    });
    if (!agency) throw new NotFoundException('Agência não encontrada.');

    const funeral = await this.prisma.funeral.findFirst({
      where: { id: funeralId, agencyId: agency.id, publicNoticeEnabled: true },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado ou não público.');

    const authorName = dto.authorName.trim();
    const message = dto.message.trim();

    if (authorName.length < 2 || authorName.length > 80) {
      throw new BadRequestException('O nome deve ter entre 2 e 80 caracteres.');
    }
    if (message.length < 5 || message.length > 1000) {
      throw new BadRequestException('A mensagem deve ter entre 5 e 1000 caracteres.');
    }

    await this.prisma.condolence.create({
      data: {
        funeralId,
        authorName,
        message,
        approved: !agency.condolenceModeration,
      },
    });

    return {
      success: true,
      moderated: agency.condolenceModeration,
      message: agency.condolenceModeration
        ? 'A sua condolência foi registada e aguarda aprovação.'
        : 'Condolência registada. Obrigado.',
    };
  }
}
