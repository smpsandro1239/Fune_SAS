import { PrismaClient, FlyerPlan, SubscriptionPlan, UserRole, ServiceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    id: 'elegante-minimal-template',
    name: 'Elegante Minimalista',
    plan: FlyerPlan.FREE,
    description: 'Linhas limpas, tipografia generosa e uma única moldura fina. Design HD discreto e moderno.',
    primaryColor: '#0f172a',
    secondaryColor: '#ffffff',
    accentColor: '#94a3b8',
    fontFamily: 'sans',
    layoutStyle: 'elegante-minimal',
  },
  {
    id: 'classico-sobrio-template',
    name: 'Clássico Sóbrio',
    plan: FlyerPlan.FREE,
    description: 'Preto e branco com serifa clássica, cruz ornamentada e moldura dupla. Respeito e tradição.',
    primaryColor: '#1c1917',
    secondaryColor: '#fafaf9',
    accentColor: '#a8a29e',
    fontFamily: 'serif',
    layoutStyle: 'classico-sobrio',
  },
  {
    id: 'floral-suave-template',
    name: 'Floral Suave',
    plan: FlyerPlan.FREE,
    description: 'Ramo de flores suaves em tons pastel, evocando serenidade e carinho.',
    primaryColor: '#44403c',
    secondaryColor: '#fdfbf7',
    accentColor: '#d6b8a0',
    fontFamily: 'serif',
    layoutStyle: 'floral-suave',
  },
  {
    id: 'dourado-premium-template',
    name: 'Dourado Imperial',
    plan: FlyerPlan.PREMIUM,
    description: 'Relevo dourado, cantoneiras ornamentadas e véu de brilho. Dignidade máxima para a despedida.',
    primaryColor: '#111827',
    secondaryColor: '#fffdf5',
    accentColor: '#c9a227',
    fontFamily: 'serif',
    layoutStyle: 'dourado-premium',
  },
  {
    id: 'marmore-premium-template',
    name: 'Textura Mármore',
    plan: FlyerPlan.PREMIUM,
    description: 'Fundo de mármore nobre com veios subtis e medalhão de foto em relevo.',
    primaryColor: '#292524',
    secondaryColor: '#f5f1ea',
    accentColor: '#b99b6b',
    fontFamily: 'serif',
    layoutStyle: 'marmore-premium',
  },
  {
    id: 'luz-radiante-template',
    name: 'Luz Radiante',
    plan: FlyerPlan.PREMIUM,
    description: 'Raios de luz celestial emanando do topo, sobre fundo azul-noite profundo. Esperança e elevação.',
    primaryColor: '#0b1120',
    secondaryColor: '#0e1a2f',
    accentColor: '#e8c96a',
    fontFamily: 'sans',
    layoutStyle: 'luz-radiante',
  },
  {
    id: 'jardim-premium-template',
    name: 'Jardim da Saudade',
    plan: FlyerPlan.PREMIUM,
    description: 'Alecrim, oliveira e rosas desenhadas à mão numa moldura de jardim em tons verdes e creme.',
    primaryColor: '#1c2b21',
    secondaryColor: '#f7f5ee',
    accentColor: '#7d9b76',
    fontFamily: 'serif',
    layoutStyle: 'jardim-premium',
  },
  {
    id: 'velas-premium-template',
    name: 'Chama de Velas',
    plan: FlyerPlan.PREMIUM,
    description: 'Velas acesas em silhueta, aurora quente e espaço para uma mensagem de despedida.',
    primaryColor: '#191208',
    secondaryColor: '#2b1f10',
    accentColor: '#e0a458',
    fontFamily: 'serif',
    layoutStyle: 'velas-premium',
  },
  {
    id: 'profundidade-3d-template',
    name: 'Profundidade 3D',
    plan: FlyerPlan.ULTRA,
    description: 'Camadas com perspetiva, sombras profundas e movimento parallax subtil no ecrã.',
    primaryColor: '#0c0a1d',
    secondaryColor: '#1a1435',
    accentColor: '#c7b9ff',
    fontFamily: 'display',
    layoutStyle: 'profundidade-3d',
  },
  {
    id: 'aquarela-ultra-template',
    name: 'Aquarela Celeste',
    plan: FlyerPlan.ULTRA,
    description: 'Efeito de aquarela com lavagens de cor desenhadas em CSS e manchas suaves de tinta.',
    primaryColor: '#334155',
    secondaryColor: '#f8fafc',
    accentColor: '#7aa2c4',
    fontFamily: 'serif',
    layoutStyle: 'aquarela-ultra',
  },
  {
    id: 'video-ultra-template',
    name: 'Céu em Movimento',
    plan: FlyerPlan.ULTRA,
    description: 'Fundo de vídeo em silêncio (estrelas, nuvens ou chama) com sobreposição elegante.',
    primaryColor: '#020617',
    secondaryColor: '#0b1220',
    accentColor: '#fcd34d',
    fontFamily: 'sans',
    layoutStyle: 'video-ultra',
  },
  {
    id: 'casa-hortas-template',
    name: 'Modelo Casa Hortas (Azul & Dourado)',
    plan: FlyerPlan.PREMIUM,
    description: 'Design premium baseado no modelo tradicional com cabeçalho azul escuro, moldura em arco dourado para foto, ícones elegantes e cartão da agência com brasão.',
    primaryColor: '#0a192f',
    secondaryColor: '#ffffff',
    accentColor: '#d4af37',
    fontFamily: 'sans',
    layoutStyle: 'casa-hortas',
  },
  {
    id: 'classico-ouro-template',
    name: 'Modelo Clássico Dourado',
    plan: FlyerPlan.PREMIUM,
    description: 'Estilo sóbrio e solene com moldura dourada ornamentada e tipografia serifa luxuosa.',
    primaryColor: '#0f172a',
    secondaryColor: '#f8fafc',
    accentColor: '#c5a059',
    fontFamily: 'serif',
    layoutStyle: 'classico-ouro',
  },
  {
    id: 'sereno-minimal-template',
    name: 'Modelo Sereno Minimalista',
    plan: FlyerPlan.FREE,
    description: 'Visual moderno e limpo, ideal para leitura rápida e impressão económica.',
    primaryColor: '#1e293b',
    secondaryColor: '#ffffff',
    accentColor: '#64748b',
    fontFamily: 'sans',
    layoutStyle: 'sereno-minimal',
  },
];

const EDITABLE_FIELDS = [
  'title',
  'deceasedName',
  'age',
  'photoUrl',
  'funeralDateFormatted',
  'parishLocation',
  'cemeteryLocation',
  'deathLocation',
  'wakeDetailsFormatted',
  'agencyName',
  'agencyAddress',
  'agencyLocation',
  'agencyFounded',
  'agencyWebsite',
  'agencyLogoUrl',
  'agencyLogoType',
  'agencyInitials',
  'primaryColor',
  'accentColor',
];

async function seedTemplates() {
  for (const template of TEMPLATES) {
    await prisma.flyerTemplate.upsert({
      where: { id: template.id },
      create: {
        ...template,
        category: 'PARTICIPACAO',
        editableFields: EDITABLE_FIELDS,
      },
      update: {
        ...template,
        editableFields: EDITABLE_FIELDS,
      },
    });
  }
  console.log(`Templates: ${TEMPLATES.length} sincronizados.`);
}

async function seedAgency({
  name,
  slug,
  email,
  password,
  role,
  plan,
  data,
}: {
  name: string;
  slug: string;
  email: string;
  password: string;
  role: UserRole;
  plan: SubscriptionPlan;
  data: Record<string, string>;
}) {
  const passwordHash = await bcrypt.hash(password, 10);

  const agency = await prisma.agency.upsert({
    where: { slug },
    create: {
      name,
      slug,
      subscriptionPlan: plan,
      ...data,
    },
    update: { name, subscriptionPlan: plan, ...data },
  });

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      agencyId: agency.id,
      name: `Administrador ${name}`,
      email,
      passwordHash,
      role,
    },
    update: { role },
  });

  const existingSubscription = await prisma.subscription.findFirst({
    where: { agencyId: agency.id },
  });
  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        agencyId: agency.id,
        plan,
        priceCents: plan === 'PRO' ? 2900 : plan === 'ENTERPRISE' ? 9900 : 0,
        status: 'ACTIVE',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return { agency, user };
}

async function seedDemoData() {
  const casahortas = await prisma.agency.findUnique({ where: { slug: 'casa-hortas' } });
  const minhocentral = await prisma.agency.findUnique({ where: { slug: 'minho-central' } });

  if (casahortas) {
    const deceased = await prisma.deceased.upsert({
      where: { id: 'demo-deceased-luis-freitas' },
      create: {
        id: 'demo-deceased-luis-freitas',
        agencyId: casahortas.id,
        fullName: 'LUÍS FILIPE DA SILVA FREITAS',
        age: 27,
        dateOfDeath: new Date('2026-07-08T09:00:00.000Z'),
        placeOfDeath: 'Hospital de Braga',
      },
      update: { agencyId: casahortas.id },
    });

    await prisma.funeral.upsert({
      where: { id: 'demo-funeral-luis-freitas' },
      create: {
        id: 'demo-funeral-luis-freitas',
        agencyId: casahortas.id,
        deceasedId: deceased.id,
        serviceType: ServiceType.CERIMONIA,
        funeralDate: new Date('2026-07-08T17:00:00.000Z'),
        funeralTime: '17:00',
        locationParish: 'Igreja Paroquial da Ventosa, Braga',
        cemeteryLocation: 'Ventosa, Vieira do Minho',
        wakeLocation: 'Igreja Paroquial da Ventosa',
        wakeDate: new Date('2026-07-08T15:30:00.000Z'),
        wakeTime: '15:30',
        status: 'SCHEDULED',
        publicNoticeEnabled: true,
      },
      update: { agencyId: casahortas.id },
    });
    console.log('Dados de demonstração da Casa Hortas criados.');
  }

  if (minhocentral) {
    const deceased = await prisma.deceased.upsert({
      where: { id: 'demo-deceased-maria-antunes' },
      create: {
        id: 'demo-deceased-maria-antunes',
        agencyId: minhocentral.id,
        fullName: 'MARIA DA CONCEIÇÃO ANTUNES',
        age: 84,
        dateOfDeath: new Date('2026-08-10T09:00:00.000Z'),
        placeOfDeath: 'Hospital de Braga',
      },
      update: { agencyId: minhocentral.id },
    });

    await prisma.funeral.upsert({
      where: { id: 'demo-funeral-maria-antunes' },
      create: {
        id: 'demo-funeral-maria-antunes',
        agencyId: minhocentral.id,
        deceasedId: deceased.id,
        serviceType: ServiceType.CREMACAO,
        funeralDate: new Date('2026-08-12T15:00:00.000Z'),
        funeralTime: '15:00',
        locationParish: 'Igreja de São Lázaro, Braga',
        cemeteryLocation: 'Crematório de Braga',
        status: 'IN_PROGRESS',
        publicNoticeEnabled: true,
      },
      update: { agencyId: minhocentral.id },
    });
    console.log('Dados de demonstração da Minho Central criados.');
  }
}

async function main() {
  await seedTemplates();

  await seedAgency({
    name: 'Funerária Casa Hortas, Lda',
    slug: 'casa-hortas',
    email: 'admin@casahortas.com',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    plan: SubscriptionPlan.PRO,
    data: {
      phone: '+351 253 123 456',
      email: 'geral@casahortas.com',
      address: 'Rua das Maceirinhas, Cabreiros, Braga',
      location: 'Ventosa, Vieira do Minho',
      foundedYear: 'DESDE 1890',
      website: 'www.casahortas.com',
    },
  });
  console.log('Agência Casa Hortas + utilizador admin@casahortas.com criados.');

  await seedAgency({
    name: 'Agência Funerária Minho Central',
    slug: 'minho-central',
    email: 'admin@minhocentral.pt',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    plan: SubscriptionPlan.ENTERPRISE,
    data: {
      phone: '+351 253 987 654',
      email: 'contacto@minhocentral.pt',
      address: 'Avenida Central, 140, Braga',
      location: 'Braga',
      foundedYear: 'DESDE 1975',
      website: 'www.minhocentral.pt',
    },
  });
  console.log('Agência Minho Central + utilizador admin@minhocentral.pt criados.');

  await seedDemoData();

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
