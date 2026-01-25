import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, Matches, IsOptional } from 'class-validator';

export class UpdateBusinessHoursDto {
  @ApiProperty({ example: '09:00', description: 'Format: HH:mm', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'openTime must be in HH:mm format',
  })
  openTime?: string;

  @ApiProperty({ example: '17:00', description: 'Format: HH:mm', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'closeTime must be in HH:mm format',
  })
  closeTime?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;
}
