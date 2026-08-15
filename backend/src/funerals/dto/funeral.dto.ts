import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FuneralStatus, ServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateFuneralDto {
  @ApiProperty({ description: 'ID do falecido' })
  @IsString()
  deceasedId: string;

  @ApiProperty({ enum: ServiceType, example: ServiceType.CERIMONIA })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({ example: '2026-07-08T17:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  funeralDate: Date;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  funeralTime?: string;

  @ApiPropertyOptional({ example: 'Igreja Paroquial da Ventosa, Braga' })
  @IsOptional()
  @IsString()
  locationParish?: string;

  @ApiPropertyOptional({ example: 'Ventosa, Vieira do Minho' })
  @IsOptional()
  @IsString()
  cemeteryLocation?: string;

  @ApiPropertyOptional({ example: 'Igreja Paroquial da Ventosa' })
  @IsOptional()
  @IsString()
  wakeLocation?: string;

  @ApiPropertyOptional({ example: '2026-07-08T15:30:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  wakeDate?: Date;

  @ApiPropertyOptional({ example: '15:30' })
  @IsOptional()
  @IsString()
  wakeTime?: string;

  @ApiPropertyOptional({ description: 'Observações internas' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: FuneralStatus, example: FuneralStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(FuneralStatus)
  status?: FuneralStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  publicNoticeEnabled?: boolean;
}

export class UpdateFuneralDto {
  @ApiPropertyOptional({ enum: ServiceType })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiPropertyOptional({ example: '2026-07-08T17:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  funeralDate?: Date;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  funeralTime?: string;

  @ApiPropertyOptional({ example: 'Igreja Paroquial da Ventosa, Braga' })
  @IsOptional()
  @IsString()
  locationParish?: string;

  @ApiPropertyOptional({ example: 'Ventosa, Vieira do Minho' })
  @IsOptional()
  @IsString()
  cemeteryLocation?: string;

  @ApiPropertyOptional({ example: 'Igreja Paroquial da Ventosa' })
  @IsOptional()
  @IsString()
  wakeLocation?: string;

  @ApiPropertyOptional({ example: '2026-07-08T15:30:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  wakeDate?: Date;

  @ApiPropertyOptional({ example: '15:30' })
  @IsOptional()
  @IsString()
  wakeTime?: string;

  @ApiPropertyOptional({ description: 'Observações internas' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: FuneralStatus })
  @IsOptional()
  @IsEnum(FuneralStatus)
  status?: FuneralStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  publicNoticeEnabled?: boolean;
}
