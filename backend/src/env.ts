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
export function validateEnv(logger: { error: (msg: string) => void }): RequiredEnv | never {
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

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  };
}
