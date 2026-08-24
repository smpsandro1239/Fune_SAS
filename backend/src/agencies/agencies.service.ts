import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class AgenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyAgency(user: AuthenticatedUser) {
    const isAdmin = user.role === UserRole.ADMIN;

    const agency = await this.prisma.agency.findUnique({
      where: { id: user.agencyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        phone: true,
        email: true,
        address: true,
        location: true,
        foundedYear: true,
        website: true,
        subscriptionPlan: true,
        facebookPageUrl: true,
        instagramPageUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        tiktokUrl: true,
        autoPublish: true,
        publishDefaultMsg: true,
        condolenceModeration: true,
        // Credenciais da Graph API — apenas visíveis ao ADMIN
        ...(isAdmin && {
          facebookPageId: true,
          facebookPageAccessToken: true,
          instagramBusinessId: true,
        }),
        createdAt: true,
        updatedAt: true,
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
    // Nunca devolver o token na resposta do update
    const updated = await this.prisma.agency.update({
      where: { id: user.agencyId },
      data: dto,
    });
    return this.getMyAgency(user);
  }
}
