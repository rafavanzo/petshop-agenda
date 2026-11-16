import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CriarUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome' })
  @MaxLength(100)
  nome!: string;

  @IsString()
  @Matches(/^[a-z0-9._]{3,30}$/, {
    message:
      'Usuário deve ter de 3 a 30 caracteres: letras minúsculas, números, ponto ou underline',
  })
  usuario!: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  senha!: string;
}