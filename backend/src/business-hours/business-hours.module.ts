import { Module } from '@nestjs/common';
import { BusinessHoursService } from './business-hours.service';
import { BusinessHoursController } from './business-hours.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BusinessHoursController],
  providers: [BusinessHoursService, PrismaService],
  exports: [BusinessHoursService],
})
export class BusinessHoursModule {}
