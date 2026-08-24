import { Injectable, Logger } from '@nestjs/common';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private get apiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  }

  private get from(): string {
    return process.env.EMAIL_FROM || 'Fune_SAS <onboarding@resend.dev>';
  }

  get configured(): boolean {
    return !!this.apiKey;
  }

  async send({ to, subject, html }: SendEmailOptions): Promise<{ sent: boolean }> {
    if (!this.configured) {
      this.logger.warn(`RESEND_API_KEY não configurada — email para ${to} não enviado.`);
      return { sent: false };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: this.from, to: [to], subject, html }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        this.logger.error(`Falha ao enviar email para ${to}: ${res.status} ${body}`);
        return { sent: false };
      }
      return { sent: true };
    } catch (err) {
      this.logger.error(`Erro ao enviar email para ${to}`, err as Error);
      return { sent: false };
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<{ sent: boolean }> {
    return this.send({
      to,
      subject: 'Recuperação de palavra-passe — Fune_SAS',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#040B16;color:#fff;border-radius:12px;">
          <h1 style="color:#EAB308;font-size:20px;margin-bottom:8px;">Fune_SAS</h1>
          <p style="color:#cbd5e1;font-size:14px;line-height:1.6;">
            Recebemos um pedido de recuperação de palavra-passe para a sua conta.
          </p>
          <p style="margin:24px 0;">
            <a href="${resetUrl}"
               style="background:#EAB308;color:#040B16;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
              Redefinir palavra-passe
            </a>
          </p>
          <p style="color:#94a3b8;font-size:12px;line-height:1.6;">
            Este link é válido durante 1 hora. Se não solicitou a recuperação, pode ignorar este email.
          </p>
        </div>
      `,
    });
  }
}
