# FuneSAS - SaaS Funerário

Plataforma SaaS multi-agência para gestão completa de agências funerárias, criação e edição visual de participações/flyers de falecimento, gestão documental, agenda de cerimónias, relatórios analíticos e portal público de obituários.

## 🚀 Funcionalidades Principais

- **Gestão Multi-agência (SaaS)**: Isolamento de agências, personalização de marca e planos de subscrição (Free, Pro, Enterprise).
- **Editor Visual Interativo de Flyers**:
  - Renderização em tempo real (SVG/Canvas).
  - Inclui o modelo fiel **"Funerária Casa Hortas"** (layout em azul escuro e dourado com moldura de foto em arco, ícones de velório/cruz/calendário e monograma da agência).
  - Exportação direta em **PDF** para impressão e **PNG** para redes sociais/WhatsApp.
- **Gestão de Funerais & Falecidos**: Registo detalhado de velório, cerimónia, cemitério e observações internas.
- **Gestão Documental**: Armazenamento e upload de certidões, autorizações e contratos.
- **Agenda & Notificações**: Calendário interativo com tarefas e lembretes de serviços funerários.
- **Relatórios & Estatísticas**: Dashboard analítico de serviços executados e utilização da plataforma.
- **Portal Público de Participações**: Páginas de anúncio de falecimento para consulta familiar e partilha nas redes sociais.

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS + Lucide Icons + Framer Motion
- **Banco de Dados**: Prisma ORM (SQLite local / PostgreSQL em produção)
- **Exportação Gráfica**: `html-to-image` e `jsPDF`

## 📦 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o banco de dados e dados iniciais (seed)
npx prisma db push
npm run db:seed

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
