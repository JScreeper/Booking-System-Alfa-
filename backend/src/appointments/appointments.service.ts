import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../common/enums';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, createDto: CreateAppointmentDto, organizationId: string) {
    const { serviceId, startTime, notes } = createDto;

    // Check if service exists and belongs to organization
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.organizationId !== organizationId) {
      throw new NotFoundException('Service not found');
    }

    if (!service.isActive) {
      throw new BadRequestException('Service is not active');
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration * 60000);

    // Check for double booking within the same organization
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        organizationId,
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException(
        'This time slot is already booked. Please choose another time.',
      );
    }

    // Check business hours for this organization
    const dayOfWeek = start.getDay();
    const businessHours = await this.prisma.businessHours.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId,
          dayOfWeek,
        },
      },
    });

    if (!businessHours || !businessHours.isOpen) {
      throw new BadRequestException('Business is closed on this day');
    }

    const startTimeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const endTimeStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

    if (
      startTimeStr < businessHours.openTime ||
      endTimeStr > businessHours.closeTime
    ) {
      throw new BadRequestException(
        'Appointment time is outside business hours',
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        organizationId,
        userId,
        serviceId,
        startTime: start,
        endTime: end,
        notes,
        status: AppointmentStatus.PENDING,
      },
      include: {
        service: true,
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

    // Send confirmation email
    try {
      await this.emailService.sendAppointmentConfirmation(
        appointment.user.email,
        appointment.user.firstName,
        appointment.service.name,
        start,
        end,
      );
    } catch (error) {
      // Log error but don't fail the appointment creation
      console.error('Failed to send confirmation email:', error);
    }

    return appointment;
  }

  async findAll(organizationId: string, userId?: string, isAdmin = false) {
    try {
      console.log('findAll called with:', { organizationId, userId, isAdmin });
      
      const where: any = { organizationId };

      if (!isAdmin && userId) {
        where.userId = userId;
      }

      console.log('Query where clause:', JSON.stringify(where, null, 2));

      const appointments = await this.prisma.appointment.findMany({
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
        orderBy: { startTime: 'desc' },
      });

      console.log(`Found ${appointments.length} appointments`);

      // Filter out any appointments with missing service or user (data integrity)
      const validAppointments = appointments.filter((apt) => {
        const isValid = apt.service && apt.user;
        if (!isValid) {
          console.warn('Filtering out invalid appointment:', {
            id: apt.id,
            hasService: !!apt.service,
            hasUser: !!apt.user,
          });
        }
        return isValid;
      });

      console.log(`Valid appointments: ${validAppointments.length}`);

      // NestJS will automatically serialize Date objects to ISO strings
      return validAppointments;
    } catch (error: any) {
      console.error('Error in findAll:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        userId,
        isAdmin,
      });
      throw error;
    }
  }

  async findOne(id: string, organizationId: string, userId?: string, isAdmin = false) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
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

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found');
    }

    // Check permissions
    if (!isAdmin && appointment.userId !== userId) {
      throw new ForbiddenException('You do not have access to this appointment');
    }

    return appointment;
  }

  async update(
    id: string,
    updateDto: UpdateAppointmentDto,
    organizationId: string,
    userId?: string,
    isAdmin = false,
  ) {
    const appointment = await this.findOne(id, organizationId, userId, isAdmin);
    const oldStatus = appointment.status;

    // Only admin can change status
    if (!isAdmin && updateDto.status) {
      delete updateDto.status;
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: updateDto,
      include: {
        service: true,
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

    // Send email if status changed to CONFIRMED
    if (
      updateDto.status &&
      oldStatus !== updateDto.status &&
      updateDto.status === AppointmentStatus.CONFIRMED
    ) {
      try {
        await this.emailService.sendAppointmentConfirmation(
          updatedAppointment.user.email,
          updatedAppointment.user.firstName,
          updatedAppointment.service.name,
          new Date(updatedAppointment.startTime),
          new Date(updatedAppointment.endTime),
        );
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
      }
    }

    return updatedAppointment;
  }

  async remove(id: string, organizationId: string, userId?: string, isAdmin = false) {
    const appointment = await this.findOne(id, organizationId, userId, isAdmin);

    // Cancel instead of delete
    const cancelledAppointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: {
        service: true,
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

    // Send cancellation email
    try {
      await this.emailService.sendAppointmentCancellation(
        cancelledAppointment.user.email,
        cancelledAppointment.user.firstName,
        cancelledAppointment.service.name,
        new Date(cancelledAppointment.startTime),
      );
    } catch (error) {
      // Log error but don't fail the cancellation
      console.error('Failed to send cancellation email:', error);
    }

    return cancelledAppointment;
  }

  async getAvailableTimeSlots(serviceId: string, date: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const businessHours = await this.prisma.businessHours.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId: service.organizationId,
          dayOfWeek,
        },
      },
    });

    if (!businessHours || !businessHours.isOpen) {
      return [];
    }

    // Get existing appointments for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        organizationId: service.organizationId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
    });

    // Generate time slots
    const [openHour, openMin] = businessHours.openTime.split(':').map(Number);
    const [closeHour, closeMin] = businessHours.closeTime.split(':').map(Number);

    const openTime = new Date(selectedDate);
    openTime.setHours(openHour, openMin, 0, 0);

    const closeTime = new Date(selectedDate);
    closeTime.setHours(closeHour, closeMin, 0, 0);

    const slots: string[] = [];
    const slotDuration = service.duration;
    let currentTime = new Date(openTime);

    while (currentTime.getTime() + slotDuration * 60000 <= closeTime.getTime()) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

      // Check if slot conflicts with existing appointment
      const hasConflict = existingAppointments.some((apt) => {
        return (
          (slotStart >= apt.startTime && slotStart < apt.endTime) ||
          (slotEnd > apt.startTime && slotEnd <= apt.endTime) ||
          (slotStart <= apt.startTime && slotEnd >= apt.endTime)
        );
      });

      if (!hasConflict) {
        slots.push(slotStart.toISOString());
      }

      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    return slots;
  }

  async getAnalytics(startDate?: Date, endDate?: Date) {
    try {
      console.log('getAnalytics called with:', { startDate, endDate });
      
      const where: any = {};

      if (startDate || endDate) {
        where.startTime = {};
        if (startDate) {
          const start = new Date(startDate);
          if (isNaN(start.getTime())) {
            throw new BadRequestException('Invalid startDate format');
          }
          where.startTime.gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          if (isNaN(end.getTime())) {
            throw new BadRequestException('Invalid endDate format');
          }
          where.startTime.lte = end;
        }
      }
      
      console.log('Query where clause:', {
        ...where,
        startTime: where.startTime ? {
          gte: where.startTime.gte ? where.startTime.gte.toISOString() : undefined,
          lte: where.startTime.lte ? where.startTime.lte.toISOString() : undefined,
        } : undefined,
      });

      console.log('Fetching appointments from database...');
      const appointments = await this.prisma.appointment.findMany({
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

      // Filter out appointments with missing service or user
      const validAppointments = appointments.filter(
        (apt) => apt.service && apt.user
      );
      
      console.log(`Valid appointments: ${validAppointments.length}`);

      // Status breakdown
      const statusBreakdown = {
        PENDING: validAppointments.filter((a) => a.status === 'PENDING').length,
        CONFIRMED: validAppointments.filter((a) => a.status === 'CONFIRMED').length,
        COMPLETED: validAppointments.filter((a) => a.status === 'COMPLETED').length,
        CANCELLED: validAppointments.filter((a) => a.status === 'CANCELLED').length,
      };

      // Revenue calculation
      const revenue = validAppointments
        .filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
        .reduce((sum, a) => {
          try {
            const price = a.service?.price ? Number(a.service.price) : 0;
            if (isNaN(price)) return sum;
            return sum + price;
          } catch (err) {
            console.error('Error calculating revenue for appointment:', a.id, err);
            return sum;
          }
        }, 0);

      // Appointments by day (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        date.setHours(0, 0, 0, 0);
        return date.toISOString().split('T')[0];
      });

      const appointmentsByDay = last30Days.map((date) => {
        try {
          const count = validAppointments.filter((a) => {
            if (!a.startTime) return false;
            const appointmentDate = new Date(a.startTime);
            if (isNaN(appointmentDate.getTime())) return false;
            return appointmentDate.toISOString().split('T')[0] === date;
          }).length;
          return { date, count };
        } catch (err) {
          console.error('Error processing appointmentsByDay for date:', date, err);
          return { date, count: 0 };
        }
      });

      // Appointments by service
      const serviceCounts: Record<string, number> = {};
      validAppointments.forEach((a) => {
        if (a.service && a.service.name) {
          const serviceName = a.service.name;
          serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
        }
      });

      const topServices = Object.entries(serviceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Appointments by hour (peak hours)
      const hourCounts: Record<number, number> = {};
      validAppointments.forEach((a) => {
        try {
          if (!a.startTime) return;
          const appointmentDate = new Date(a.startTime);
          if (isNaN(appointmentDate.getTime())) return;
          const hour = appointmentDate.getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        } catch (err) {
          console.error('Error processing hour for appointment:', a.id, err);
        }
      });

      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Revenue by day (last 30 days)
      const revenueByDay = last30Days.map((date) => {
        try {
          const dayRevenue = validAppointments
            .filter((a) => {
              if (!a.startTime) return false;
              const appointmentDate = new Date(a.startTime);
              if (isNaN(appointmentDate.getTime())) return false;
              return (
                appointmentDate.toISOString().split('T')[0] === date &&
                (a.status === 'CONFIRMED' || a.status === 'COMPLETED')
              );
            })
            .reduce((sum, a) => {
              const price = a.service?.price ? Number(a.service.price) : 0;
              if (isNaN(price)) return sum;
              return sum + price;
            }, 0);
          return { date, revenue: dayRevenue };
        } catch (err) {
          console.error('Error processing revenueByDay for date:', date, err);
          return { date, revenue: 0 };
        }
      });

      const result = {
        totalAppointments: validAppointments.length,
        statusBreakdown,
        revenue,
        appointmentsByDay,
        revenueByDay,
        topServices,
        peakHours,
      };
      
      console.log('Analytics result prepared successfully');
      console.log('Result summary:', {
        totalAppointments: result.totalAppointments,
        revenue: result.revenue,
        topServicesCount: result.topServices.length,
        peakHoursCount: result.peakHours.length,
      });
      
      return result;
    } catch (error: any) {
      console.error('Error in getAnalytics:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        startDate,
        endDate,
      });
      throw error;
    }
  }
}
