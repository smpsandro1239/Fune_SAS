# Fune_SAS

SaaS multi-agência para gestão funerária: funerais, falecidos, documentos (PDF gerados e uploads), flyers desenháveis, página pública de homenagem com condolências moderadas, notificações (email/WhatsApp), analytics e subscrições com planos.

**Produção:** https://fune-sas.vercel.app · API: https://fune-sas-api.onrender.com/api · Swagger (dev): `/api/docs`

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, jsPDF |
| Backend | NestJS 10, Prisma ORM, JWT (access + refresh), Swagger, Throttler |
| Base de dados | PostgreSQL (Neon) |
| Pagamentos | Stripe Checkout (subscrições PRO/ENTERPRISE, EUR, webhooks) |
| Emails | Resend |
| WhatsApp | Meta Cloud API |
| Storage | S3-compatível (`@aws-sdk/client-s3`) com fallback para disco local |
| CI | GitHub Actions — lint, typecheck, testes unitários + E2E |

## Funcionalidades

- **Auth**: registo de agência + admin, login, refresh token rotation, reset de password por email
- **Funerais & falecidos**: CRUD com estados (`SCHEDULED`, `ONGOING`, `COMPLETED`, `CANCELLED`)
- **Documentos**: uploads autenticados (JPG/PNG/WebP/PDF até 10MB) + geração de PDFs oficiais (condolências, declaração de presença, autorização de sepultamento, guias de pagamento, relatórios…)
- **Flyers**: editor visual com layouts Free/Pro/Premium e exportação
- **Página pública**: homenagem por slug da agência + ID do funeral, condolências com honeypot anti-spam e moderação opcional
- **Notificações**: in-app (dropdown), email transacional, WhatsApp Cloud API
- **Subscrições**: FREE/PRO/ENTERPRISE com limites aplicados no backend (funerais, utilizadores, documentos); checkout Stripe; downgrades/caducidade automáticos
- **Segurança**: Helmet, CORS allowlist, rate limiting global + por endpoint, validação estrita de DTOs (`whitelist` + `forbidNonWhitelisted`)

## Estrutura

```
├── src/                  # Frontend Next.js
│   ├── app/(app)/        # Páginas autenticadas (agenda, documentos, flyers, …)
│   ├── app/public/       # Página pública de homenagem
│   └── components/       # Layout, flyers, toasts
├── backend/
│   ├── src/              # Módulos NestJS (auth, funerals, documents, subscriptions, …)
│   │   └── storage/      # Abstração S3/disco para uploads
│   ├── prisma/           # schema.prisma
│   └── test/             # Suite E2E supertest
└── .github/workflows/    # CI
```

## Arranque local

### Backend

```bash
cd backend
npm install
cp .env.example .env        # ou criar .env manualmente (ver abaixo)
npx prisma generate && npx prisma db push
npm run db:seed             # dados de demonstração
npm run start:dev           # http://localhost:4000/api
```

`.env` mínimo do backend:

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<64 hex>
JWT_REFRESH_SECRET=<64 hex>
APP_URL=http://localhost:3000
# Opcionais:
STRIPE_SECRET_KEY=          # sem chave → checkout em modo demo
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM="Fune_SAS <noreply@dominio.pt>"
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
S3_BUCKET=                  # sem bucket → uploads em ./uploads locais
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=                # opcional (R2/B2/Wasabi); vazio = AWS S3
CORS_ORIGINS=               # origens extra separadas por vírgulas
```

### Frontend

```bash
npm install
echo "DATABASE_URL=postgresql://..." > .env   # para o Prisma do frontend
npm run dev                                   # http://localhost:3000
```

## Testes

```bash
cd backend
npm run lint            # ESLint + Prettier
npx tsc --noEmit -p tsconfig.json
npm test                # unitários (jest)
npm run test:e2e        # E2E contra DATABASE_URL real (usa a mesma BD)
```

No CI, o job E2E só corre se o secret `DATABASE_URL` estiver configurado no repositório GitHub (*Settings → Secrets and variables → Actions*).

## Deploy

- **Frontend** → Vercel (auto-deploy do `main`). Env: `DATABASE_URL`, `NEXT_PUBLIC_API_URL`.
- **Backend** → Render (deploy manual). Env obrigatória: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`; recomendadas: Stripe, Resend, WhatsApp, S3.
- Webhook Stripe: `https://fune-sas-api.onrender.com/api/subscriptions/webhook`.

> ⚠️ Sem as variáveis `S3_*`, os uploads ficam no disco efémero do Render e perdem-se a cada redeploy.
