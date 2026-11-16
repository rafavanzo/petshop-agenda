import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AtualizarUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome' })
  @MaxLength(100)
  nome!: string;
}