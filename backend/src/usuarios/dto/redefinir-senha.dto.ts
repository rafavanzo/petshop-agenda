import { IsString, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  senha!: string;
}