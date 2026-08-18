import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(agencyId: string) {
    return this.prisma.flyerDraft.findMany({
      where: { agencyId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, layoutStyle: true, createdAt: true, updatedAt: true },
    });
  }

  async findOne(id: string, agencyId: string) {
    const draft = await this.prisma.flyerDraft.findFirst({ where: { id, agencyId } });
    if (!draft) throw new NotFoundException('Rascunho não encontrado');
    return draft;
  }

  create(body: { name: string; layoutStyle: string; data: any }, agencyId: string, userId: string) {
    return this.prisma.flyerDraft.create({
      data: {
        agencyId,
        userId,
        name: body.name,
        layoutStyle: body.layoutStyle,
        data: body.data,
      },
    });
  }

  async update(id: string, body: { name?: string; layoutStyle?: string; data?: any }, agencyId: string) {
    const draft = await this.prisma.flyerDraft.findFirst({ where: { id, agencyId } });
    if (!draft) throw new NotFoundException('Rascunho não encontrado');
    return this.prisma.flyerDraft.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.layoutStyle !== undefined && { layoutStyle: body.layoutStyle }),
        ...(body.data !== undefined && { data: body.data }),
      },
    });
  }

  async remove(id: string, agencyId: string) {
    const draft = await this.prisma.flyerDraft.findFirst({ where: { id, agencyId } });
    if (!draft) throw new NotFoundException('Rascunho não encontrado');
    return this.prisma.flyerDraft.delete({ where: { id } });
  }
}
