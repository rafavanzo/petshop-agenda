import { IsDateString, Matches } from 'class-validator';

export class AgendaDiaDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'Data inválida' })
  data!: string;
}