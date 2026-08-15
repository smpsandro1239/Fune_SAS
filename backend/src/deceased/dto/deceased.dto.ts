import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class CreateDeceasedDto {
  @ApiProperty({ example: 'LUÍS FILIPE DA SILVA FREITAS' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 27 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(130)
  age?: number;

  @ApiPropertyOptional({ example: '1999-03-14T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: '2026-07-08T09:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfDeath?: Date;

  @ApiPropertyOptional({ example: 'Hospital de Braga' })
  @IsOptional()
  @IsString()
  placeOfDeath?: string;

  @ApiPropertyOptional({ example: 'https://cdn.exemplo.pt/foto.jpg' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}

export class UpdateDeceasedDto {
  @ApiPropertyOptional({ example: 'LUÍS FILIPE DA SILVA FREITAS' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 27 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(130)
  age?: number;

  @ApiPropertyOptional({ example: '1999-03-14T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: '2026-07-08T09:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfDeath?: Date;

  @ApiPropertyOptional({ example: 'Hospital de Braga' })
  @IsOptional()
  @IsString()
  placeOfDeath?: string;

  @ApiPropertyOptional({ example: 'https://cdn.exemplo.pt/foto.jpg' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
