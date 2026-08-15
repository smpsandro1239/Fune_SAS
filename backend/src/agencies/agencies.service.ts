import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class AgenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyAgency(user: AuthenticatedUser) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: user.agencyId },
      include: {
        _count: { select: { users: true, funerals: true, deceaseds: true, documents: true } },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!agency) throw new NotFoundException('Agência não encontrada.');
    return agency;
  }

  async update(user: AuthenticatedUser, dto: UpdateAgencyDto) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas o administrador pode alterar os dados da agência.');
    }
    return this.prisma.agency.update({
      where: { id: user.agencyId },
      data: dto,
    });
  }
}
