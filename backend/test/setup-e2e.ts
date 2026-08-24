/**
 * Setup executado antes dos testes E2E.
 * Garante que as env obrigatórias existem (local lê backend/.env; na CI
 * DATABASE_URL é injetada pelo workflow) e que os segredos JWT têm fallback,
 * para o arranque do AppModule nunca falhar por env em falta.
 */
import * as dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

dotenv.config();

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'e2e-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'e2e-refresh-secret';

// Webhook Stripe: garantir comportamento determinístico (400 "não configurado")
delete process.env.STRIPE_WEBHOOK_SECRET;

if (!process.env.DATABASE_URL) {
  // Sem base de dados não há E2E — falha rápida com mensagem clara
  throw new Error(
    'DATABASE_URL não está definida. Configure-a no ambiente ou num ficheiro backend/.env para correr os testes E2E.',
  );
}
