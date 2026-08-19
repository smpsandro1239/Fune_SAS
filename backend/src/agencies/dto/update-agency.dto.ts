import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateAgencyDto {
  @ApiPropertyOptional({ example: 'Funerária Casa Hortas, Lda' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'casa-hortas' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.exemplo.pt/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '+351 253 123 456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'geral@casahortas.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Rua das Maceirinhas, Cabreiros, Braga' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Ventosa, Vieira do Minho' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'DESDE 1890' })
  @IsOptional()
  @IsString()
  foundedYear?: string;

  @ApiPropertyOptional({ example: 'www.casahortas.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/sua-pagina' })
  @IsOptional()
  @IsString()
  facebookPageUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/seu-perfil' })
  @IsOptional()
  @IsString()
  instagramPageUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/...' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/seu-perfil' })
  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/@canal' })
  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @ApiPropertyOptional({ example: 'https://tiktok.com/@perfil' })
  @IsOptional()
  @IsString()
  tiktokUrl?: string;
}
