const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndMakeAdmin() {
  try {
    // Proveri sve korisnike
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log('\n📋 Korisnici u bazi:');
    console.log('='.repeat(50));
    
    if (users.length === 0) {
      console.log('❌ Nema korisnika u bazi!');
      console.log('\n💡 Prvo se registruj preko aplikacije, pa pokreni ovaj script ponovo.');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Ime: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });

    // Promeni sve korisnike u ADMIN
    console.log('🔄 Menjam role svih korisnika u ADMIN...');
    console.log('='.repeat(50));

    for (const user of users) {
      if (user.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
        console.log(`✅ ${user.email} → ADMIN`);
      } else {
        console.log(`ℹ️  ${user.email} je već ADMIN`);
      }
    }

    console.log('\n✅ Gotovo! Svi korisnici su sada ADMIN.');
    console.log('\n💡 VAŽNO: Logout-uj se i uloguj ponovo da bi promena stupila na snagu!');
    console.log('   Zatim idi na /admin da vidiš admin panel.\n');

  } catch (error) {
    console.error('❌ Greška:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndMakeAdmin();
