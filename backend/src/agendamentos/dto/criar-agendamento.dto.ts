import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Servico } from '../../generated/prisma/client';
import { HORA_ABERTURA, HORA_FECHAMENTO } from '../agenda.constantes';

export class CriarAgendamentoDto {
  @IsInt({ message: 'Informe o pet' })
  petId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'Data inválida' })
  data!: string;

  @IsInt()
  @Min(HORA_ABERTURA, { message: `O expediente começa às ${HORA_ABERTURA}h` })
  @Max(HORA_FECHAMENTO - 1, {
    message: `O último horário é às ${HORA_FECHAMENTO - 1}h`,
  })
  hora!: number;

  @IsEnum(Servico, { message: 'Serviço deve ser BANHO ou TOSA' })
  servico!: Servico;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}