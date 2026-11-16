import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Especie } from '../../generated/prisma/client';

export class FiltroPetsDto {
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsEnum(Especie, { message: 'Espécie deve ser CACHORRO ou GATO' })
  especie?: Especie;
}