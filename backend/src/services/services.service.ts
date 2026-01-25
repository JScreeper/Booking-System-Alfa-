import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, organizationId: string) {
    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, includeInactive = false) {
    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }
    
    return this.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.organizationId !== organizationId) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, organizationId: string) {
    await this.findOne(id, organizationId); // Check if exists and belongs to organization

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId); // Check if exists and belongs to organization

    return this.prisma.service.delete({
      where: { id },
    });
  }
}
