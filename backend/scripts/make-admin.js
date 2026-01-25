const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node make-admin.js <email>');
    console.error('Example: node make-admin.js admin@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      console.error('Please register first, then run this script.');
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`User ${email} is already an admin.`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log(`You can now login and access the admin panel at /admin`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
