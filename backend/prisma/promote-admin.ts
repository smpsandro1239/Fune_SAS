import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Promove um utilizador para SUPER_ADMIN.
 * Uso: npm run promote-admin -- admin@casahortas.com
 */
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Indica o email: npm run promote-admin -- <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Utilizador com email "${email}" não encontrado.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: UserRole.SUPER_ADMIN },
  });

  console.log(`Utilizador "${email}" promovido a SUPER_ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
