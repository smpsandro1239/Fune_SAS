import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCondolenceDto {
  @ApiProperty({ example: 'Família Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  authorName: string;

  @ApiProperty({ example: 'Os nossos mais sentidos pêsames.' })
  @IsString()
  @IsNotEmpty({ message: 'A mensagem é obrigatória.' })
  @MaxLength(1000, { message: 'A mensagem deve ter no máximo 1000 caracteres.' })
  message: string;
}
