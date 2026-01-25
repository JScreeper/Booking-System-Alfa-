import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, MinLength } from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({ example: 'Haircut', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiProperty({ example: 'Professional haircut service', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 30, description: 'Duration in minutes', required: false })
  @IsNumber()
  @IsOptional()
  @Min(5)
  duration?: number;

  @ApiProperty({ example: 25.99, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
