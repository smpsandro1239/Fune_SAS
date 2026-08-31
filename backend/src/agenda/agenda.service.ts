import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendaItemDto, UpdateAgendaItemDto } from './dto/agenda-item.dto';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista itens de agenda dentro de um intervalo de datas (ISO), ordenados por data e hora. */
  findAll(agencyId: string, from?: string, to?: string) {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    return this.prisma.agendaItem.findMany({
      where: {
        agencyId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async findOne(id: string, agencyId: string) {
    const item = await this.prisma.agendaItem.findFirst({ where: { id, agencyId } });
    if (!item) throw new NotFoundException('Item de agenda não encontrado');
    return item;
  }

  create(dto: CreateAgendaItemDto, agencyId: string, userId: string) {
    return this.prisma.agendaItem.create({
      data: {
        agencyId,
        createdById: userId,
        date: new Date(dto.date),
        time: dto.time ?? null,
        title: dto.title,
        description: dto.description ?? null,
        color: dto.color ?? 'gold',
      },
    });
  }

  async update(id: string, dto: UpdateAgendaItemDto, agencyId: string) {
    await this.findOne(id, agencyId);
    return this.prisma.agendaItem.update({
      where: { id },
      data: {
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.time !== undefined && { time: dto.time ?? null }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description ?? null }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async remove(id: string, agencyId: string) {
    await this.findOne(id, agencyId);
    return this.prisma.agendaItem.delete({ where: { id } });
  }
}
