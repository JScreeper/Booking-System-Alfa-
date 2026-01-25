import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  @ApiResponse({ status: 400, description: 'Bad request (double booking, etc.)' })
  create(@CurrentUser() user: any, @Body() createDto: CreateAppointmentDto) {
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }
    return this.appointmentsService.create(user.id, createDto, user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments (user sees own, admin sees all)' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async findAll(@CurrentUser() user: any, @Query('admin') admin?: string) {
    try {
      if (!user) {
        throw new Error('User not found in request');
      }
      if (!user?.organizationId) {
        throw new Error('User organization not found');
      }
      const isAdmin = user.role === Role.ADMIN && admin === 'true';
      return await this.appointmentsService.findAll(user.organizationId, user.id, isAdmin);
    } catch (error: any) {
      console.error('Error in findAll controller:', {
        error: error.message,
        stack: error.stack,
        user: user ? { id: user.id, role: user.role } : 'null',
      });
      throw error;
    }
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get available time slots for a service and date' })
  @ApiResponse({ status: 200, description: 'List of available time slots' })
  getAvailableSlots(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableTimeSlots(serviceId, date);
  }

  @Get('analytics/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get analytics data (Admin only)' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (user.role !== Role.ADMIN) {
        throw new Error('Forbidden: Admin access required');
      }
      
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const result = await this.appointmentsService.getAnalytics(start, end);
      return result;
    } catch (error: any) {
      console.error('Error in getAnalytics controller:', {
        message: error.message,
        stack: error.stack,
        user: user ? { id: user.id, role: user.role } : 'null',
        startDate,
        endDate,
      });
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }
    const isAdmin = user.role === Role.ADMIN;
    return this.appointmentsService.findOne(id, user.organizationId, user.id, isAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateAppointmentDto,
  ) {
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }
    const isAdmin = user.role === Role.ADMIN;
    return this.appointmentsService.update(id, updateDto, user.organizationId, user.id, isAdmin);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }
    const isAdmin = user.role === Role.ADMIN;
    return this.appointmentsService.remove(id, user.organizationId, user.id, isAdmin);
  }
}
