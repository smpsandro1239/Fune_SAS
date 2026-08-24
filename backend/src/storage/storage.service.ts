import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { createReadStream } from 'fs';
import { join } from 'path';
import { writeFile, readFile, rm } from 'fs/promises';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

/** Pasta local usada quando o S3 não está configurado (dev / fallback) */
export const UPLOADS_DIR = join(process.cwd(), 'uploads');

/**
 * Abstração de armazenamento de ficheiros.
 * - Se S3_BUCKET/S3_REGION/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY estiverem definidas,
 *   os uploads vão para um bucket S3-compatível (AWS S3, Cloudflare R2, Backblaze B2, Wasabi).
 * - Caso contrário, usa o disco local (adequado em dev; no Render é efémero).
 *
 * Compatível com endpoints customizados via S3_ENDPOINT.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client | null = null;

  get configured(): boolean {
    return !!(
      process.env.S3_BUCKET &&
      process.env.S3_REGION &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
    );
  }

  private getClient(): S3Client {
    if (!this.client) {
      if (!this.configured) {
        throw new ServiceUnavailableException('Storage S3 não está configurado.');
      }
      this.client = new S3Client({
        region: process.env.S3_REGION!,
        ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
        // Path-style é necessário para a maioria dos endpoints S3-compatíveis (R2, B2, MinIO…)
        forcePathStyle: !!process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });
      this.logger.log(
        `Storage S3 ativo — bucket ${process.env.S3_BUCKET}` +
          (process.env.S3_ENDPOINT ? ` (${process.env.S3_ENDPOINT})` : ''),
      );
    }
    return this.client;
  }

  /** Garante que a pasta de uploads local existe */
  ensureLocalDir(): string {
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    return UPLOADS_DIR;
  }

  /** Guarda um ficheiro no storage ativo. key = nome único do ficheiro. */
  async save(key: string, buffer: Buffer, contentType: string): Promise<void> {
    if (this.configured) {
      const client = this.getClient();
      await client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: `uploads/${key}`,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return;
    }
    this.ensureLocalDir();
    await writeFile(join(UPLOADS_DIR, key), buffer);
  }

  /** Lê um ficheiro do storage ativo. Lança ServiceUnavailableException se falhar. */
  async read(key: string): Promise<Buffer> {
    if (this.configured) {
      const client = this.getClient();
      try {
        const res = await client.send(
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: `uploads/${key}`,
          }),
        );
        const bytes = await res.Body!.transformToByteArray();
        return Buffer.from(bytes);
      } catch (err) {
        this.logger.error(`Erro ao ler ${key} do S3: ${String(err)}`);
        throw new ServiceUnavailableException('Ficheiro indisponível no storage remoto.');
      }
    }
    const filePath = join(UPLOADS_DIR, key);
    if (!existsSync(filePath)) {
      throw new ServiceUnavailableException('Ficheiro não encontrado.');
    }
    return readFile(filePath);
  }

  /** Stream para ficheiros locais (usado pelo serveFile no modo disco). */
  readLocalStream(key: string): NodeJS.ReadableStream {
    return createReadStream(join(this.ensureLocalDir(), key));
  }

  existsLocal(key: string): boolean {
    return existsSync(join(UPLOADS_DIR, key));
  }

  /** Apaga um ficheiro do storage ativo (best-effort — nunca lança). */
  async remove(key: string): Promise<void> {
    try {
      if (this.configured) {
        const client = this.getClient();
        await client.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: `uploads/${key}`,
          }),
        );
        return;
      }
      const filePath = join(UPLOADS_DIR, key);
      if (existsSync(filePath)) await rm(filePath, { force: true });
    } catch (err) {
      this.logger.warn(`Não foi possível apagar ${key} do storage: ${String(err)}`);
    }
  }

  /** Usado apenas por testes — limpa a pasta local. */
  async cleanupLocal(): Promise<void> {
    await rm(UPLOADS_DIR, { recursive: true, force: true }).catch(() => undefined);
  }
}
