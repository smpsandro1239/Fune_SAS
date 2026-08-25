import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';

/** Sufixo único por execução para não colidir com dados reais da base partilhada */
const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const EMAIL = `e2e-${unique}@funesas.test`;
const SLUG = `e2e-agencia-${unique}`;
const PASSWORD = 'E2ePassword123!';

describe('Fune_SAS API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let deceasedId: string;
  let funeralId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Espelhar a configuração de main.ts (prefixo, pipes e guard global)
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
    await app.init();
  });

  afterAll(async () => {
    // Limpeza: apagar a agência criada (a cascata remove users, funerais, etc.)
    try {
      const prisma = app.get(PrismaService);
      await prisma.agency.deleteMany({ where: { slug: SLUG } });
      await prisma.user.deleteMany({ where: { email: EMAIL } });
    } catch {
      // base já limpa / indisponível no teardown
    }
    await app.close();
  });

  it('GET /api/health responde ok com base de dados up', () =>
    request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.database).toBe('up');
      }));

  it('POST /api/auth/register cria agência + admin e devolve tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'E2E Admin',
        email: EMAIL,
        password: PASSWORD,
        agencyName: 'Agência E2E',
        agencySlug: SLUG,
      })
      .expect(201);

    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    accessToken = res.body.accessToken;
  });

  it('POST /api/auth/register rejeita email duplicado (400)', () =>
    request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'E2E Duplicado',
        email: EMAIL,
        password: PASSWORD,
        agencyName: 'Agência E2E Duplicada',
      })
      .expect(400));

  it('GET /api/auth/me sem token é rejeitado (401)', () =>
    request(app.getHttpServer()).get('/api/auth/me').expect(401));

  it('POST /api/auth/login com password errada devolve 401', () =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: EMAIL, password: 'PasswordErrada1!' })
      .expect(401));

  it('GET /api/agencies/me devolve a agência criada', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/agencies/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.id).toBeTruthy();
    expect(res.body.slug).toBe(SLUG);
    expect(res.body.subscriptionPlan).toBe('FREE');
  });

  it('POST /api/deceased cria um falecido', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/deceased')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fullName: 'E2E MANUEL DA SILVA',
        age: 82,
        placeOfDeath: 'Hospital E2E',
      })
      .expect(201);

    deceasedId = res.body.id;
    expect(res.body.fullName).toBe('E2E MANUEL DA SILVA');
  });

  it('POST /api/funerals rejeita payload com campo desconhecido (400)', () =>
    request(app.getHttpServer())
      .post('/api/funerals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        deceasedId: 'qualquer',
        serviceType: 'CERIMONIA',
        funeralDate: new Date().toISOString(),
        campoIntruso: true,
      })
      .expect(400));

  it('POST /api/funerals cria funeral público', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/funerals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        deceasedId,
        serviceType: 'CERIMONIA',
        funeralDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        funeralTime: '11:00',
        locationParish: 'Igreja E2E, Braga',
        cemeteryLocation: 'Cemitério E2E',
        publicNoticeEnabled: true,
      })
      .expect(201);

    funeralId = res.body.id;
    expect(funeralId).toBeTruthy();
    expect(res.body.deceased.fullName).toBe('E2E MANUEL DA SILVA');
  });

  it('GET /api/funerals lista inclui o funeral criado', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/funerals')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((f: { id: string }) => f.id === funeralId)).toBe(true);
  });

  it('PATCH /api/funerals/:id atualiza o estado', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/funerals/${funeralId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('GET /api/public/:slug/:funeralId expõe a participação pública', () =>
    request(app.getHttpServer())
      .get(`/api/public/${SLUG}/${funeralId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.agency.slug).toBe(SLUG);
        expect(res.body.funeral.id).toBe(funeralId);
        expect(res.body.funeral.deceased.fullName).toBe('E2E MANUEL DA SILVA');
      }));

  it('POST /api/public/.../condolences aceita mensagem e honeypot vazio', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/public/${SLUG}/${funeralId}/condolences`)
      .send({ authorName: 'Família E2E', message: 'Os nossos sentidos pêsames.' })
      .expect(201);

    // Agências novas têm moderação desligada → aprovada de imediato
    expect(res.body.success).toBe(true);
    expect(res.body.moderated).toBe(false);
  });

  it('POST condolência com honeypot preenchido é rejeitada (400)', () =>
    request(app.getHttpServer())
      .post(`/api/public/${SLUG}/${funeralId}/condolences`)
      .send({ authorName: 'Bot', message: 'spam spam spam', website: 'http://spam.example' })
      .expect(400));

  it('Ativar moderação via PATCH /api/agencies/me', () =>
    request(app.getHttpServer())
      .patch('/api/agencies/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ condolenceModeration: true })
      .expect(200));

  it('Condolência seguinte fica pendente e aparece na queue', async () => {
    await request(app.getHttpServer())
      .post(`/api/public/${SLUG}/${funeralId}/condolences`)
      .send({ authorName: 'Vizinho E2E', message: 'Fica com a paz do Senhor.' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/funerals/condolences/queue')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const pending = res.body.find(
      (c: { authorName: string; approved: boolean }) =>
        c.authorName === 'Vizinho E2E' && c.approved === false,
    );
    expect(pending).toBeTruthy();

    await request(app.getHttpServer())
      .patch(`/api/funerals/${funeralId}/condolences/${pending.id}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('Página pública mostra apenas condolências aprovadas', () =>
    request(app.getHttpServer())
      .get(`/api/public/${SLUG}/${funeralId}`)
      .expect(200)
      .expect((res) => {
        const names: string[] = res.body.funeral.condolences.map(
          (c: { authorName: string }) => c.authorName,
        );
        expect(names).toContain('Família E2E');
        expect(names).toContain('Vizinho E2E');
        expect(names).not.toContain('Bot');
      }));

  it('GET /api/subscriptions/current devolve plano FREE inicial', () =>
    request(app.getHttpServer())
      .get('/api/subscriptions/current')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.plan).toBe('FREE');
        expect(res.body.agency.subscriptionPlan).toBe('FREE');
      }));

  it('GET /api/subscriptions/usage devolve uso e limites FREE', () =>
    request(app.getHttpServer())
      .get('/api/subscriptions/usage')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.plan).toBe('FREE');
        expect(res.body.limits.maxFunerals).toBe(10);
        expect(res.body.usage.funerals).toBeGreaterThanOrEqual(1);
        expect(res.body.usage.users).toBe(1);
      }));

  it('POST /api/subscriptions/webhook sem assinatura é rejeitado (400)', () =>
    request(app.getHttpServer()).post('/api/subscriptions/webhook').send({}).expect(400));

  describe('Documentos (upload/download via StorageService)', () => {
    // PNG 1x1 válido
    const PNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    let uploadedFileName: string;
    let documentId: string;

    it('POST /api/documents faz upload de um PDF/PNG', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('title', 'E2E Certidão')
        .field('type', 'CERTIFICATE')
        .attach('file', PNG, { filename: 'e2e-test.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body.fileName).toMatch(/\.png$/);
      expect(res.body.fileSize).toBe(PNG.length);
      expect(res.body.mimeType).toBe('image/png');
      uploadedFileName = res.body.fileName;
      documentId = res.body.id;
    });

    it('GET /api/documents/file/:filename descarrega o ficheiro autenticado', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/documents/file/${uploadedFileName}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.headers['content-type']).toBe('image/png');
      expect(Buffer.compare(res.body as Buffer, PNG)).toBe(0);
    });

    it('GET ficheiro sem token é rejeitado (401)', () =>
      request(app.getHttpServer()).get(`/api/documents/file/${uploadedFileName}`).expect(401));

    it('DELETE /api/documents/:id remove o documento e o ficheiro', async () => {
      await request(app.getHttpServer())
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect({ success: true });

      await request(app.getHttpServer())
        .get(`/api/documents/file/${uploadedFileName}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  it('DELETE /api/funerals/:id remove o funeral', () =>
    request(app.getHttpServer())
      .delete(`/api/funerals/${funeralId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200));
});
