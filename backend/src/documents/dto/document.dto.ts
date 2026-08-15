import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Certidão de óbito' })
  @IsString()
  title: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.CERTIFICATE })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiPropertyOptional({ description: 'ID do funeral associado (opcional)' })
  @IsOptional()
  @IsString()
  funeralId?: string;
}
