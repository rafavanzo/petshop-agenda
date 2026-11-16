import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Especie, Porte } from '../../generated/prisma/client';

export class CriarPetDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome do pet' })
  @MaxLength(60)
  nome!: string;

  @IsEnum(Especie, { message: 'Espécie deve ser CACHORRO ou GATO' })
  especie!: Especie;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  raca?: string;

  @IsOptional()
  @IsEnum(Porte, { message: 'Porte deve ser PEQUENO, MEDIO ou GRANDE' })
  porte?: Porte;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe o nome do tutor' })
  @MaxLength(100)
  tutorNome!: string;

  @Matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
    message: 'Telefone inválido. Use o formato (19) 99876-5432',
  })
  tutorTelefone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe o endereço do tutor' })
  @MaxLength(200)
  tutorEndereco!: string;
}