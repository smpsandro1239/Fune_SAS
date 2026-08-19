import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString, IsObject } from 'class-validator';

export class CreatePublicationDto {
  @ApiProperty({ example: 'Falecimento de João Silva' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Com grande pesar...' })
  @IsString()
  caption: string;

  @ApiProperty({ enum: ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'] })
  @IsEnum(['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'] as const)
  platform: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funeralId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}

export class UpdatePublicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
