import { ServiceUnavailableException } from '@nestjs/common';
import { existsSync } from 'fs';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { StorageService, UPLOADS_DIR } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  const originalEnv = {
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  };

  const clearS3Env = () => {
    delete process.env.S3_BUCKET;
    delete process.env.S3_REGION;
    delete process.env.S3_ACCESS_KEY_ID;
    delete process.env.S3_SECRET_ACCESS_KEY;
  };

  beforeEach(() => {
    jest.resetModules();
    clearS3Env();
    service = new StorageService();
  });

  afterAll(async () => {
    Object.entries(originalEnv).forEach(([k, v]) => {
      if (v === undefined) delete (process.env as Record<string, unknown>)[k];
      else process.env[k] = v;
    });
    await rm(UPLOADS_DIR, { recursive: true, force: true }).catch(() => undefined);
  });

  describe('configured', () => {
    it('é false sem env S3', () => {
      expect(service.configured).toBe(false);
    });

    it('é false se faltar alguma variável', () => {
      process.env.S3_BUCKET = 'b';
      process.env.S3_REGION = 'eu-west-1';
      expect(service.configured).toBe(false);
    });

    it('é true com todas as variáveis', () => {
      process.env.S3_BUCKET = 'b';
      process.env.S3_REGION = 'eu-west-1';
      process.env.S3_ACCESS_KEY_ID = 'key';
      process.env.S3_SECRET_ACCESS_KEY = 'secret';
      const svc = new StorageService();
      expect(svc.configured).toBe(true);
    });
  });

  describe('modo disco (fallback)', () => {
    it('save + read + existsLocal funcionam em disco', async () => {
      await service.save('teste-1.txt', Buffer.from('ola'), 'text/plain');
      expect(service.existsLocal('teste-1.txt')).toBe(true);

      const buf = await service.read('teste-1.txt');
      expect(buf.toString()).toBe('ola');
    });

    it('ensureLocalDir cria a pasta de uploads', () => {
      const dir = service.ensureLocalDir();
      expect(dir).toBe(UPLOADS_DIR);
      expect(existsSync(dir)).toBe(true);
    });

    it('remove apaga o ficheiro local', async () => {
      await service.save('teste-2.txt', Buffer.from('x'), 'text/plain');
      await service.remove('teste-2.txt');
      expect(service.existsLocal('teste-2.txt')).toBe(false);
    });

    it('remove não lança para ficheiro inexistente', async () => {
      await expect(service.remove('nao-existe.txt')).resolves.toBeUndefined();
    });

    it('read lança ServiceUnavailableException para ficheiro inexistente', async () => {
      await expect(service.read('fantasma.txt')).rejects.toThrow(ServiceUnavailableException);
    });

    it('readLocalStream devolve stream legível', async () => {
      await service.save('stream.txt', Buffer.from('stream'), 'text/plain');
      const chunks: Buffer[] = [];
      const stream = service.readLocalStream('stream.txt');
      await new Promise<void>((resolve) => {
        stream.on('data', (c: Buffer) => chunks.push(c));
        stream.on('end', () => resolve());
      });
      expect(Buffer.concat(chunks).toString()).toBe('stream');
    });
  });

  describe('modo S3', () => {
    it('getClient sem cliente inicializado lança quando chamado diretamente', async () => {
      // read em modo "configurado" mas com rede indisponível → ServiceUnavailableException
      process.env.S3_BUCKET = 'fake-bucket';
      process.env.S3_REGION = 'eu-west-1';
      process.env.S3_ACCESS_KEY_ID = 'key';
      process.env.S3_SECRET_ACCESS_KEY = 'secret';
      process.env.S3_ENDPOINT = 'http://127.0.0.1:1'; // porta fechada — falha rápido

      const svc = new StorageService();
      await expect(svc.read('qualquer.txt')).rejects.toThrow(ServiceUnavailableException);
    }, 30000);
  });

  describe('isolamento da pasta local', () => {
    it('não interfere com ficheiros fora de uploads', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'storage-test-'));
      const filePath = join(tempDir, 'fora.txt');
      await writeFile(filePath, 'fora');
      // save escreve sempre dentro de UPLOADS_DIR
      await service.save('dentro.txt', Buffer.from('dentro'), 'text/plain');
      expect(await readFile(filePath, 'utf-8')).toBe('fora');
      await rm(tempDir, { recursive: true, force: true });
    });
  });
});
