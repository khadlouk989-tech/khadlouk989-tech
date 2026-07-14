const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Platform administrator' }
  });

  const coachRole = await prisma.role.upsert({
    where: { name: 'Coach' },
    update: {},
    create: { name: 'Coach', description: 'Gym coach' }
  });

  const memberRole = await prisma.role.upsert({
    where: { name: 'Member' },
    update: {},
    create: { name: 'Member', description: 'Gym member' }
  });

  const password = await bcrypt.hash('Admin1234!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@smartgym.fr' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'SmartGym',
      email: 'admin@smartgym.fr',
      password,
      roleId: adminRole.id,
      status: 'active'
    }
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
