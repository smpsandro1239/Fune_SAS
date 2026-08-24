import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeceasedDto, UpdateDeceasedDto } from './dto/deceased.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class DeceasedService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: AuthenticatedUser, search?: string) {
    return this.prisma.deceased.findMany({
      where: {
        agencyId: user.agencyId,
        ...(search ? { fullName: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: {
        _count: { select: { funerals: true } },
        funerals: {
          select: { id: true, funeralDate: true, status: true },
          orderBy: { funeralDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const deceased = await this.prisma.deceased.findFirst({
      where: { id, agencyId: user.agencyId },
      include: { funerals: { include: { documents: true }, orderBy: { funeralDate: 'desc' } } },
    });
    if (!deceased) throw new NotFoundException('Falecido não encontrado.');
    return deceased;
  }

  create(user: AuthenticatedUser, dto: CreateDeceasedDto) {
    return this.prisma.deceased.create({
      data: { agencyId: user.agencyId, ...dto },
    });
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateDeceasedDto) {
    const existing = await this.prisma.deceased.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!existing) throw new NotFoundException('Falecido não encontrado.');
    return this.prisma.deceased.update({ where: { id }, data: dto });
  }

  async remove(user: AuthenticatedUser, id: string) {
    const existing = await this.prisma.deceased.findFirst({
      where: { id, agencyId: user.agencyId },
    });
    if (!existing) throw new NotFoundException('Falecido não encontrado.');
    await this.prisma.deceased.delete({ where: { id } });
    return { success: true };
  }
}
