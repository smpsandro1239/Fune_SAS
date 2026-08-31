import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { validateEnv } from './env';
import { SentryFilter } from './common/filters/sentry.filter';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://fune-sas.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function getAllowedOrigins(): string[] {
  const extra = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

async function bootstrap() {
  // Falha imediatamente se faltar alguma env obrigatória
  const bootLogger = new Logger('Env');
  validateEnv(bootLogger);

  // Sentry só é inicializado se houver DSN configurado
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
    bootLogger.log('Sentry inicializado.');
  }

  // rawBody é necessário para verificar a assinatura do webhook Stripe
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.use(helmet());

  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir pedidos sem Origin (curl, server-to-server, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  app.useGlobalFilters(new SentryFilter());

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  // NOTA: uploads deixaram de ser servidos como static público.
  // São servidos por /documents/file/:filename com autenticação JWT.

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Fune_SAS API')
      .setDescription(
        'API do SaaS funerário multi-agência: autenticação JWT, gestão de agências, utilizadores, funerais, falecidos, documentos, templates de flyer, relatórios, notificações e subscrições.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token obtido em /auth/login',
        },
        'access-token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  logger.log(`API disponível em http://localhost:${port}/api`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`Documentação Swagger em http://localhost:${port}/api/docs`);
  }
}
bootstrap();
