import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Oliveira' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name: string;

  @ApiProperty({ example: 'admin@casahortas.com' })
  @IsEmail({}, { message: 'Email inválido.' })
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(8, { message: 'A password deve ter pelo menos 8 caracteres.' })
  password: string;

  @ApiProperty({ example: 'Funerária Casa Hortas, Lda' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da agência é obrigatório.' })
  agencyName: string;

  @ApiProperty({ example: 'casa-hortas', required: false })
  @IsOptional()
  @IsString()
  agencySlug?: string;

  @ApiProperty({ example: 'Rua das Maceirinhas, Cabreiros, Braga', required: false })
  @IsOptional()
  @IsString()
  agencyAddress?: string;

  @ApiProperty({ example: 'Braga', required: false })
  @IsOptional()
  @IsString()
  agencyLocation?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@casahortas.com' })
  @IsEmail({}, { message: 'Email inválido.' })
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty({ message: 'A password é obrigatória.' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de atualização (refresh token)' })
  @IsString()
  @IsNotEmpty({ message: 'O refresh token é obrigatório.' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@casahortas.com' })
  @IsEmail({}, { message: 'Email inválido.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperação recebido por email' })
  @IsString()
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  token: string;

  @ApiProperty({ example: 'NovaPassword123!' })
  @IsString()
  @MinLength(8, { message: 'A password deve ter pelo menos 8 caracteres.' })
  newPassword: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'Ana Oliveira' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'ana@casahortas.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido.' })
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @IsNotEmpty({ message: 'A password atual é obrigatória.' })
  currentPassword: string;

  @ApiProperty({ example: 'NovaPassword123!' })
  @IsString()
  @MinLength(8, { message: 'A nova password deve ter pelo menos 8 caracteres.' })
  newPassword: string;
}
