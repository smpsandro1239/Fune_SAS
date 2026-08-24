import { Injectable, NotFoundException } from '@nestjs/common';
import { FuneralStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuneralDto, UpdateFuneralDto } from './dto/funeral.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';

export interface FuneralQuery {
  search?: string;
  status?: FuneralStatus;
  from?: string;
  to?: string;
}

@Injectable()
export class FuneralsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planLimits: PlanLimitsService,
  ) {}

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
    await this.planLimits.assertCanCreateFuneral(user.agencyId);

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

  /** Fila de moderação: todas as condolências da agência com dados do funeral */
  async condolencesQueue(user: AuthenticatedUser, approved?: boolean) {
    return this.prisma.condolence.findMany({
      where: {
        funeral: { agencyId: user.agencyId },
        ...(approved === undefined ? {} : { approved }),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        funeral: { select: { id: true, deceased: { select: { fullName: true } } } },
      },
    });
  }

  /** Lista de condolências de um funeral (moderação — inclui pendentes) */
  async listCondolences(user: AuthenticatedUser, funeralId: string, approved?: boolean) {
    await this.assertFuneralInAgency(user, funeralId);
    return this.prisma.condolence.findMany({
      where: { funeralId, ...(approved === undefined ? {} : { approved }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Aprova ou rejeita uma condolência */
  async setCondolenceApproval(
    user: AuthenticatedUser,
    funeralId: string,
    condolenceId: string,
    approved: boolean,
  ) {
    await this.assertFuneralInAgency(user, funeralId);
    const condolence = await this.prisma.condolence.findFirst({
      where: { id: condolenceId, funeralId },
    });
    if (!condolence) throw new NotFoundException('Condolência não encontrada.');
    return this.prisma.condolence.update({
      where: { id: condolenceId },
      data: { approved },
    });
  }

  async removeCondolence(user: AuthenticatedUser, funeralId: string, condolenceId: string) {
    await this.assertFuneralInAgency(user, funeralId);
    const condolence = await this.prisma.condolence.findFirst({
      where: { id: condolenceId, funeralId },
    });
    if (!condolence) throw new NotFoundException('Condolência não encontrada.');
    await this.prisma.condolence.delete({ where: { id: condolenceId } });
    return { success: true };
  }

  private async assertFuneralInAgency(user: AuthenticatedUser, funeralId: string) {
    const funeral = await this.prisma.funeral.findFirst({
      where: { id: funeralId, agencyId: user.agencyId },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado.');
  }
}
