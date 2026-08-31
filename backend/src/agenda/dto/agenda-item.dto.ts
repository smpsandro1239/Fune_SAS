import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const AGENDA_COLORS = ['gold', 'blue', 'green', 'purple', 'red', 'slate'] as const;

export class CreateAgendaItemDto {
  @ApiProperty({
    example: '2026-09-01',
    description: 'Dia do item (ISO) — é normalizado para o início do dia.',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  time?: string;

  @ApiProperty({ example: 'Reunião com a família' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Entregar documentação e discutir o programa.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: AGENDA_COLORS, example: 'gold', default: 'gold' })
  @IsOptional()
  @IsIn(AGENDA_COLORS)
  color?: string;
}

export class UpdateAgendaItemDto {
  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  time?: string;

  @ApiPropertyOptional({ example: 'Reunião com a família' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Entregar documentação.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: AGENDA_COLORS })
  @IsOptional()
  @IsIn(AGENDA_COLORS)
  color?: string;
}
