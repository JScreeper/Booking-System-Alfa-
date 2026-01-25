const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAppointments() {
  try {
    const count = await prisma.appointment.count();
    console.log('Total appointments:', count);
    
    if (count > 0) {
      const apps = await prisma.appointment.findMany({
        take: 1,
        include: {
          service: true,
          user: true,
        },
      });
      console.log('\nSample appointment:');
      console.log(JSON.stringify(apps[0], null, 2));
    }
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointments();
