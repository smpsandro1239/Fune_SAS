import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
/** Idade mínima antes de um ficheiro órfão ser removido (evita apagar uploads em curso) */
const MIN_AGE_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class UploadsCleanupService {
  private readonly logger = new Logger(UploadsCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Diariamente às 04:00 — remove ficheiros em /uploads sem documento associado */
  @Cron('0 4 * * *')
  async cleanupOrphanUploads() {
    try {
      const files = await readdir(UPLOADS_DIR);
      if (files.length === 0) return;

      const referenced = new Set(
        (
          await this.prisma.document.findMany({
            select: { fileName: true },
          })
        ).map((d) => d.fileName),
      );

      const now = Date.now();
      let removed = 0;

      for (const file of files) {
        if (referenced.has(file)) continue;
        const filePath = join(UPLOADS_DIR, file);
        const info = await stat(filePath);
        if (now - info.mtimeMs < MIN_AGE_MS) continue;
        await unlink(filePath);
        removed++;
      }

      if (removed > 0) {
        this.logger.log(`Limpeza de uploads: ${removed} ficheiro(s) órfão(s) removido(s).`);
      }
    } catch (err) {
      this.logger.error('Erro na limpeza de uploads órfãos', err as Error);
    }
  }
}
