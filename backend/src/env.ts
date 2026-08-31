import 'dotenv/config';

export interface RequiredEnv {
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

/**
 * Valida as variáveis de ambiente obrigatórias no arranque.
 * Falha imediatamente com uma mensagem clara em vez de rebentar mais tarde
 * com erros crípticos (ex: JWT secret undefined).
 */
export function validateEnv(logger: {
  error: (msg: string) => void;
  log?: (msg: string) => void;
}): RequiredEnv | never {
  const required: (keyof RequiredEnv)[] = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(
      `Variáveis de ambiente obrigatórias em falta: ${missing.join(', ')}. ` +
        'Configure-as no ambiente (Render) ou num ficheiro .env na pasta backend/.',
    );
    throw new Error(`Arranque abortado — env em falta: ${missing.join(', ')}`);
  }

  // Avisos (não bloqueiam): funcionalidades opcionais
  if (!process.env.RESEND_API_KEY) {
    logger.error('RESEND_API_KEY não configurada — emails não serão enviados.');
  }

  if (!process.env.SENTRY_DSN) {
    logger.log?.('SENTRY_DSN não configurada — sem monitorização de erros no Sentry.');
  }

  // Storage de uploads: S3-compatível ou disco local
  const s3Vars = ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'].filter(
    (key) => !process.env[key],
  );
  if (s3Vars.length === 0) {
    logger.log?.('Storage S3 ativo — uploads persistentes.');
  } else if (s3Vars.length === 4) {
    logger.log?.('S3 não configurado — uploads em disco local (efémero em produção!).');
  } else {
    logger.error(`Storage S3 parcialmente configurado — falta: ${s3Vars.join(', ')}.`);
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  };
}
