import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsBoolean, Min, Max, Matches } from 'class-validator';

export class CreateBusinessHoursDto {
  @ApiProperty({ example: 1, description: '0=Sunday, 1=Monday, ..., 6=Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Format: HH:mm' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'openTime must be in HH:mm format',
  })
  openTime: string;

  @ApiProperty({ example: '17:00', description: 'Format: HH:mm' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'closeTime must be in HH:mm format',
  })
  closeTime: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  isOpen?: boolean;
}
