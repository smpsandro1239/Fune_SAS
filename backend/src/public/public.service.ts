import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateCondolenceDto } from './dto/condolence.dto';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
  ) {}

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

    const agencyFull = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: {
        id: true, condolenceModeration: true,
        name: true, email: true,
        whatsappNotifyNumber: true,
        whatsappPhoneNumberId: true,
        whatsappAccessToken: true,
      },
    });
    if (!agencyFull) throw new NotFoundException('Agência não encontrada.');

    const funeral = await this.prisma.funeral.findFirst({
      where: { id: funeralId, agencyId: agencyFull.id, publicNoticeEnabled: true },
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

    const condolence = await this.prisma.condolence.create({
      data: {
        funeralId,
        authorName,
        message,
        approved: !agencyFull.condolenceModeration,
      },
    });

    // Notificar a agência (não-bloqueante para o visitante)
    await this.notifyNewCondolence(agencyFull, funeral.id, condolence.authorName, condolence.message);

    return {
      success: true,
      moderated: agencyFull.condolenceModeration,
      message: agencyFull.condolenceModeration
        ? 'A sua condolência foi registada e aguarda aprovação.'
        : 'Condolência registada. Obrigado.',
    };
  }

  private async notifyNewCondolence(
    agency: {
      id: string;
      name: string;
      email: string | null;
      whatsappNotifyNumber: string | null;
      whatsappPhoneNumberId: string | null;
      whatsappAccessToken: string | null;
    },
    funeralId: string,
    authorName: string,
    message: string,
  ): Promise<void> {
    const preview = message.length > 200 ? `${message.slice(0, 200)}…` : message;

    if (agency.email) {
      await this.emailService.send({
        to: agency.email,
        subject: `Nova condolência — ${agency.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#040B16;color:#fff;border-radius:12px;">
            <h2 style="color:#EAB308;font-size:16px;margin-bottom:8px;">Nova mensagem no livro de condolências</h2>
            <p style="color:#cbd5e1;font-size:13px;"><strong>${authorName}</strong> deixou uma mensagem:</p>
            <blockquote style="color:#e2e8f0;font-size:13px;border-left:3px solid #EAB308;padding-left:12px;margin:12px 0;">${preview}</blockquote>
            <p style="font-size:12px;">
              <a href="https://fune-sas.vercel.app/condolences" style="color:#EAB308;">Moderar no painel Fune_SAS</a>
            </p>
          </div>
        `,
      });
    }

    if (agency.whatsappNotifyNumber && agency.whatsappPhoneNumberId && agency.whatsappAccessToken) {
      await this.whatsappService.sendForAgency(agency.id, {
        to: agency.whatsappNotifyNumber.replace(/[^0-9]/g, ''),
        message: `🕯️ ${agency.name}\nNova condolência de ${authorName}:\n"${preview}"`,
      });
    }
  }
}
