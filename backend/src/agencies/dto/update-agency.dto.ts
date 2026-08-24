import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ example: '123456789012345' })
  @IsOptional()
  @IsString()
  facebookPageId?: string;

  @ApiPropertyOptional({ description: 'Page Access Token para publicação via Graph API' })
  @IsOptional()
  @IsString()
  facebookPageAccessToken?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/seu-perfil' })
  @IsOptional()
  @IsString()
  instagramPageUrl?: string;

  @ApiPropertyOptional({ example: '17841400000000000' })
  @IsOptional()
  @IsString()
  instagramBusinessId?: string;

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

  @ApiPropertyOptional({
    description: 'Quando ativo, as condolências públicas exigem aprovação antes de ficarem visíveis',
  })
  @IsOptional()
  @IsBoolean()
  condolenceModeration?: boolean;

  @ApiPropertyOptional({ example: '123456789012345', description: 'WhatsApp Business Phone Number ID' })
  @IsOptional()
  @IsString()
  whatsappPhoneNumberId?: string;

  @ApiPropertyOptional({ description: 'Token de acesso do WhatsApp Cloud API (Meta)' })
  @IsOptional()
  @IsString()
  whatsappAccessToken?: string;

  @ApiPropertyOptional({ example: '351912345678', description: 'Número que recebe as notificações WhatsApp' })
  @IsOptional()
  @IsString()
  whatsappNotifyNumber?: string;
}
