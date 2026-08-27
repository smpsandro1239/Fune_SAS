import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@Injectable()
export class AgenciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

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
          whatsappPhoneNumberId: true,
          whatsappAccessToken: true,
          whatsappNotifyNumber: true,
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
    await this.prisma.agency.update({
      where: { id: user.agencyId },
      data: dto,
    });
    return this.getMyAgency(user);
  }

  /**
   * Envia uma mensagem WhatsApp de teste para o número de notificação da agência,
   * permitindo validar que a configuração do WhatsApp Cloud API está correta.
   */
  async testWhatsApp(user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas o administrador pode testar o WhatsApp.');
    }

    const agency = await this.prisma.agency.findUnique({
      where: { id: user.agencyId },
      select: { id: true, name: true, whatsappNotifyNumber: true },
    });
    if (!agency) throw new NotFoundException('Agência não encontrada.');

    const to = (agency.whatsappNotifyNumber ?? '').replace(/[^0-9]/g, '');
    if (!to) {
      return {
        sent: false,
        error: 'Define primeiro um número de notificação (whatsappNotifyNumber) na configuração.',
      };
    }

    const result = await this.whatsappService.sendForAgency(agency.id, {
      to,
      message: `🕯️ ${agency.name} — esta é uma mensagem de teste da Fune_SAS. O WhatsApp da agência está configurado corretamente.`,
    });

    return {
      sent: result.sent,
      to,
      error: result.sent
        ? null
        : 'Não foi possível enviar. Verifica o Phone Number ID e o Access Token.',
    };
  }
}
