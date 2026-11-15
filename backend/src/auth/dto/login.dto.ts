import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe o usuário' })
  usuario!: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe a senha' })
  senha!: string;
}