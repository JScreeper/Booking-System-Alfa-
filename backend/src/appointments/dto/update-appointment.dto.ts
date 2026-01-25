import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../../common/enums';

export class UpdateAppointmentDto {
  @ApiProperty({ example: '2024-01-25T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: 'CONFIRMED', enum: AppointmentStatus, required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
