const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FuneSAS initial data...');

  // 1. Create Default Agency (Casa Hortas)
  const agencyCasaHortas = await prisma.agency.upsert({
    where: { slug: 'casa-hortas' },
    update: {},
    create: {
      name: 'Funerária Casa Hortas, Lda',
      slug: 'casa-hortas',
      logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300',
      phone: '+351 253 123 456',
      email: 'geral@casahortas.com',
      address: 'Rua das Maceirinhas, Cabreiros, Braga',
      location: 'Ventosa, Vieira do Minho',
      foundedYear: '1890',
      website: 'www.casahortas.com',
      subscriptionPlan: 'PRO',
    },
  });

  // 2. Create Second Agency (Minho Central)
  const agencyMinhoCentral = await prisma.agency.upsert({
    where: { slug: 'minho-central' },
    update: {},
    create: {
      name: 'Agência Funerária Minho Central',
      slug: 'minho-central',
      logoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=300',
      phone: '+351 253 987 654',
      email: 'contacto@minhocentral.pt',
      address: 'Avenida Central, 140, Braga',
      location: 'Braga',
      foundedYear: '1975',
      website: 'www.minhocentral.pt',
      subscriptionPlan: 'ENTERPRISE',
    },
  });

  // 3. Admin User
  await prisma.user.upsert({
    where: { email: 'admin@casahortas.com' },
    update: {},
    create: {
      name: 'Sandro Pereira',
      email: 'admin@casahortas.com',
      role: 'ADMIN',
      agencyId: agencyCasaHortas.id,
    },
  });

  // 4. Sample Deceased & Funeral 1 (Matching the attached image reference)
  const deceased1 = await prisma.deceased.create({
    data: {
      fullName: 'LUÍS FILIPE DA SILVA FREITAS',
      age: 27,
      dateOfBirth: new Date('1999-04-12'),
      dateOfDeath: new Date('2026-07-06'),
      placeOfDeath: 'Hospital de Braga',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      agencyId: agencyCasaHortas.id,
    },
  });

  const funeral1 = await prisma.funeral.create({
    data: {
      deceasedId: deceased1.id,
      agencyId: agencyCasaHortas.id,
      funeralDate: new Date('2026-07-08T17:00:00'),
      funeralTime: '17:00 horas',
      locationParish: 'Igreja Paroquial da Ventosa, Braga',
      cemeteryLocation: 'Ventosa, Vieira do Minho',
      wakeLocation: 'Igreja Paroquial da Ventosa',
      wakeDate: new Date('2026-07-08T15:30:00'),
      wakeTime: '15:30 horas',
      notes: 'Local do óbito: Hospital de Braga. Velório: Quarta-feira, dia 8 de julho, 15:30 horas, na Igreja Paroquial da Ventosa',
      status: 'COMPLETED',
      publicNoticeEnabled: true,
    },
  });

  // 5. Sample Deceased & Funeral 2
  const deceased2 = await prisma.deceased.create({
    data: {
      fullName: 'MARIA JOAQUINA ALVES RIBEIRO',
      age: 84,
      dateOfBirth: new Date('1942-01-15'),
      dateOfDeath: new Date('2026-08-10'),
      placeOfDeath: 'Residência Particular, Braga',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
      agencyId: agencyCasaHortas.id,
    },
  });

  await prisma.funeral.create({
    data: {
      deceasedId: deceased2.id,
      agencyId: agencyCasaHortas.id,
      funeralDate: new Date('2026-08-14T11:00:00'),
      funeralTime: '11:00 horas',
      locationParish: 'Basílica dos Congregados, Braga',
      cemeteryLocation: 'Cemitério de Monte d’Arcos, Braga',
      wakeLocation: 'Capela de São Bento, Braga',
      wakeDate: new Date('2026-08-13T16:00:00'),
      wakeTime: '16:00 horas',
      notes: 'Velório em curso. Missa de corpo presente às 11:00h.',
      status: 'SCHEDULED',
      publicNoticeEnabled: true,
    },
  });

  // 6. Documents
  await prisma.document.create({
    data: {
      title: 'Certidão de Óbito - Luís Freitas',
      type: 'CERTIFICATE',
      fileUrl: '/uploads/certidao_luis_freitas.pdf',
      fileSize: '1.2 MB',
      agencyId: agencyCasaHortas.id,
      funeralId: funeral1.id,
    },
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
