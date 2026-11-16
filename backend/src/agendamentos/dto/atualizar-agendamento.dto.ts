import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CriarAgendamentoDto } from './criar-agendamento.dto';

// Tudo opcional, exceto que o pet não pode ser trocado
export class AtualizarAgendamentoDto extends PartialType(
  OmitType(CriarAgendamentoDto, ['petId'] as const),
) {}