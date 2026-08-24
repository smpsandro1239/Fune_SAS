import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCondolenceDto {
  @ApiProperty({ example: 'Família Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(80, { message: 'O nome deve ter no máximo 80 caracteres.' })
  authorName: string;

  @ApiProperty({ example: 'Os nossos mais sentidos pêsames.' })
  @IsString()
  @IsNotEmpty({ message: 'A mensagem é obrigatória.' })
  @MaxLength(1000, { message: 'A mensagem deve ter no máximo 1000 caracteres.' })
  message: string;

  @ApiProperty({ required: false, description: 'Campo honeypot anti-spam — deve ficar vazio' })
  @IsOptional()
  @IsString()
  @MaxLength(0, { message: 'Pedido rejeitado.' })
  website?: string;
}
