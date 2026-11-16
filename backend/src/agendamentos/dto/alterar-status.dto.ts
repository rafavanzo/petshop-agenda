import { IsEnum } from 'class-validator';
import { StatusAgendamento } from '../../generated/prisma/client';

export class AlterarStatusDto {
  @IsEnum(StatusAgendamento, {
    message: 'Status deve ser AGENDADO, EM_ANDAMENTO, CONCLUIDO ou CANCELADO',
  })
  status!: StatusAgendamento;
}