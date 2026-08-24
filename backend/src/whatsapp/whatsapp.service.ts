import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const GRAPH_VERSION = 'v21.0';

interface SendWhatsAppOptions {
  /** Número do destinatário em formato internacional sem '+' (ex: 351912345678) */
  to: string;
  message: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Envia mensagem via WhatsApp Cloud API (Meta) usando as credenciais da agência.
   * Nunca lança — falhas são registadas e devolvidas como { sent: false }.
   */
  async sendForAgency(agencyId: string, { to, message }: SendWhatsAppOptions): Promise<{ sent: boolean }> {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: { whatsappPhoneNumberId: true, whatsappAccessToken: true },
    });

    if (!agency?.whatsappPhoneNumberId || !agency.whatsappAccessToken) {
      this.logger.warn(`WhatsApp não configurado para a agência ${agencyId} — mensagem não enviada.`);
      return { sent: false };
    }

    return this.send(agency.whatsappPhoneNumberId, agency.whatsappAccessToken, { to, message });
  }

  async send(
    phoneNumberId: string,
    accessToken: string,
    { to, message }: SendWhatsAppOptions,
  ): Promise<{ sent: boolean }> {
    try {
      const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: false, body: message },
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        this.logger.error(`Falha ao enviar WhatsApp para ${to}: ${res.status} ${body}`);
        return { sent: false };
      }
      return { sent: true };
    } catch (err) {
      this.logger.error(`Erro ao enviar WhatsApp para ${to}`, err as Error);
      return { sent: false };
    }
  }
}
