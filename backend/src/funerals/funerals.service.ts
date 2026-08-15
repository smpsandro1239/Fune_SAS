import { Injectable, NotFoundException } from '@nestjs/common';
import { FuneralStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuneralDto, UpdateFuneralDto } from './dto/funeral.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';

export interface FuneralQuery {
  search?: string;
  status?: FuneralStatus;
  from?: string;
  to?: string;
}

@Injectable()
export class FuneralsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: AuthenticatedUser, query: FuneralQuery) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    return this.prisma.funeral.findMany({
      where: {
        agencyId: user.agencyId,
        ...(query.status ? { status: query.status } : {}),
        ...(from || to
          ? { funeralDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
          : {}),
        ...(query.search
          ? { deceased: { fullName: { contains: query.search, mode: 'insensitive' } } }
          : {}),
      },
      include: { deceased: true },
      orderBy: { funeralDate: 'asc' },
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const funeral = await this.prisma.funeral.findFirst({
      where: { id, agencyId: user.agencyId },
      include: {
        deceased: true,
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado.');
    return funeral;
  }

  async create(user: AuthenticatedUser, dto: CreateFuneralDto) {
    const deceased = await this.prisma.deceased.findFirst({
      where: { id: dto.deceasedId, agencyId: user.agencyId },
    });
    if (!deceased) throw new NotFoundException('Falecido não encontrado.');

    return this.prisma.funeral.create({
      data: {
        agencyId: user.agencyId,
        deceasedId: dto.deceasedId,
        serviceType: dto.serviceType,
        funeralDate: dto.funeralDate,
        funeralTime: dto.funeralTime,
        locationParish: dto.locationParish,
        cemeteryLocation: dto.cemeteryLocation,
        wakeLocation: dto.wakeLocation,
        wakeDate: dto.wakeDate,
        wakeTime: dto.wakeTime,
        notes: dto.notes,
        status: dto.status,
        publicNoticeEnabled: dto.publicNoticeEnabled ?? true,
      },
      include: { deceased: true },
    });
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateFuneralDto) {
    const existing = await this.prisma.funeral.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!existing) throw new NotFoundException('Funeral não encontrado.');
    return this.prisma.funeral.update({ where: { id }, data: dto, include: { deceased: true } });
  }

  async remove(user: AuthenticatedUser, id: string) {
    const existing = await this.prisma.funeral.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!existing) throw new NotFoundException('Funeral não encontrado.');
    await this.prisma.funeral.delete({ where: { id } });
    return { success: true };
  }

  async historyByAgency(user: AuthenticatedUser) {
    return this.prisma.funeral.findMany({
      where: { agencyId: user.agencyId },
      include: { deceased: true },
      orderBy: { funeralDate: 'desc' },
      take: 50,
    });
  }
}
