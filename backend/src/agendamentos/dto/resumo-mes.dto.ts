import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ResumoMesDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Mês deve ser de 1 a 12' })
  @Max(12, { message: 'Mês deve ser de 1 a 12' })
  mes!: number;
}