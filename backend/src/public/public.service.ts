import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCondolenceDto } from './dto/condolence.dto';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getFuneralBySlug(agencySlug: string, funeralId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        location: true,
        website: true,
        logoUrl: true,
        foundedYear: true,
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

  async generateIcs(agencySlug: string, funeralId: string): Promise<string> {
    const agency = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: { id: true, name: true },
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
        wakeLocation: true,
        deceased: { select: { fullName: true } },
      },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado ou não público.');

    const start = this.combineDateAndTime(funeral.funeralDate, funeral.funeralTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();

    const location =
      funeral.locationParish || funeral.cemeteryLocation || funeral.wakeLocation || '';

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fune_SAS//PT',
      'BEGIN:VEVENT',
      `UID:${funeral.id}@fune-sas`,
      `DTSTAMP:${this.toIcsUtc(now)}`,
      `DTSTART:${this.toIcsUtc(start)}`,
      `DTEND:${this.toIcsUtc(end)}`,
      `SUMMARY:Fúnebre de ${funeral.deceased.fullName}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${agency.name}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    return lines.map((line) => this.foldLine(line)).join('\r\n') + '\r\n';
  }

  private combineDateAndTime(date: Date, time?: string | null): Date {
    const d = new Date(date);
    if (!time || !/^\d{1,2}:\d{2}/.test(time)) return d;
    const [hours, minutes] = time.split(':').map((n) => Number(n));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return d;
    d.setUTCHours(hours, minutes, 0, 0);
    return d;
  }

  private toIcsUtc(date: Date): string {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  private foldLine(line: string): string {
    const CRLF = '\r\n';
    if (Buffer.byteLength(line, 'utf8') <= 75) return line;
    const lines: string[] = [];
    let remaining = line;
    let first = true;
    while (Buffer.byteLength(remaining, 'utf8') > 75) {
      const cut = this.cutAtLineByteLength(remaining, first ? 75 : 74);
      lines.push(first ? remaining.slice(0, cut) : ' ' + remaining.slice(0, cut));
      remaining = remaining.slice(cut);
      first = false;
    }
    if (remaining.length > 0) lines.push((first ? '' : ' ') + remaining);
    return lines.join(CRLF);
  }

  private cutAtLineByteLength(str: string, maxBytes: number): number {
    let bytes = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      bytes += code > 0x7f ? 2 : 1;
      if (bytes > maxBytes) return i;
    }
    return str.length;
  }

  async addCondolence(agencySlug: string, funeralId: string, dto: CreateCondolenceDto) {
    // Honeypot anti-spam: bots preenchem todos os campos
    if (dto.website) {
      return { success: true, message: 'Condolência registada.' };
    }

    const agencyFull = await this.prisma.agency.findUnique({
      where: { slug: agencySlug },
      select: {
        id: true,
        condolenceModeration: true,
        name: true,
        email: true,
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
    await this.notifyNewCondolence(
      agencyFull,
      funeral.id,
      condolence.authorName,
      condolence.message,
    );

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
      condolenceModeration: boolean;
      whatsappNotifyNumber: string | null;
      whatsappPhoneNumberId: string | null;
      whatsappAccessToken: string | null;
    },
    funeralId: string,
    authorName: string,
    message: string,
  ): Promise<void> {
    const preview = message.length > 200 ? `${message.slice(0, 200)}…` : message;

    // Notificação interna (painel de notificações da agência)
    await this.notificationsService.create({
      agencyId: agency.id,
      type: 'SISTEMA',
      title: 'Nova condolência',
      message: `${authorName} deixou uma nova mensagem no livro de condolências.${agency.condolenceModeration ? ' Aguarda aprovação.' : ''}`,
    });

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
