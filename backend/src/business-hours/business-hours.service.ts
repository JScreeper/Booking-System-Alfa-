import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';

@Injectable()
export class BusinessHoursService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateBusinessHoursDto, organizationId: string) {
    // Check if already exists
    const existing = await this.prisma.businessHours.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId,
          dayOfWeek: createDto.dayOfWeek,
        },
      },
    });

    if (existing) {
      return this.update(existing.id, createDto as UpdateBusinessHoursDto, organizationId);
    }

    return this.prisma.businessHours.create({
      data: {
        ...createDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.businessHours.findMany({
      where: { organizationId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const hours = await this.prisma.businessHours.findUnique({
      where: { id },
    });

    if (!hours) {
      throw new NotFoundException(`Business hours with ID ${id} not found`);
    }

    if (hours.organizationId !== organizationId) {
      throw new NotFoundException(`Business hours with ID ${id} not found`);
    }

    return hours;
  }

  async findByDay(dayOfWeek: number, organizationId: string) {
    return this.prisma.businessHours.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId,
          dayOfWeek,
        },
      },
    });
  }

  async update(id: string, updateDto: UpdateBusinessHoursDto, organizationId: string) {
    await this.findOne(id, organizationId); // Check if exists and belongs to organization

    return this.prisma.businessHours.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId); // Check if exists and belongs to organization

    return this.prisma.businessHours.delete({
      where: { id },
    });
  }
}
