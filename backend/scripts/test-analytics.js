const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAnalytics() {
  try {
    console.log('Testing analytics query...');
    
    const where = {};
    
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            isActive: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log(`Found ${appointments.length} appointments`);
    
    // Test status breakdown
    const statusBreakdown = {
      PENDING: appointments.filter((a) => a.status === 'PENDING').length,
      CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED').length,
      COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
    };
    
    console.log('Status breakdown:', statusBreakdown);
    
    // Test revenue calculation
    const revenue = appointments
      .filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
      .reduce((sum, a) => {
        const price = a.service?.price ? Number(a.service.price) : 0;
        return sum + price;
      }, 0);
    
    console.log('Revenue:', revenue);
    
    // Test appointments by day
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split('T')[0];
    });
    
    const appointmentsByDay = last30Days.map((date) => {
      const count = appointments.filter((a) => {
        const appointmentDate = new Date(a.startTime).toISOString().split('T')[0];
        return appointmentDate === date;
      }).length;
      return { date, count };
    });
    
    console.log('Appointments by day (first 5):', appointmentsByDay.slice(0, 5));
    
    console.log('✅ Analytics query successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalytics();
