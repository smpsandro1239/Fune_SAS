import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SocialService } from '../social/social.service';

@Injectable()
export class PublicationsCronService {
  private readonly logger = new Logger(PublicationsCronService.name);
  private running = false;

  constructor(
    @Inject(forwardRef(() => SocialService))
    private readonly socialService: SocialService,
  ) {}

  /**
   * Processa publicações agendadas a cada minuto.
   * O lock `running` evita execuções sobrepostas quando um lote demora
   * mais do que o intervalo do cron.
   */
  @Cron('* * * * *')
  async processScheduledPublications() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.socialService.processScheduled();
      if (result.processed > 0) {
        this.logger.log(
          `Cron: ${result.processed} publicação(ões) processada(s) — ${result.success} sucesso, ${result.failed} falha(s).`,
        );
      }
    } catch (err) {
      this.logger.error('Erro no cron de publicações', err as Error);
    } finally {
      this.running = false;
    }
  }
}
