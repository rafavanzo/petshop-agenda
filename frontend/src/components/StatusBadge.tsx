import { ROTULO_STATUS } from '../rotulos';
import type { StatusAgendamento } from '../types';
import estilos from './StatusBadge.module.css';

const CLASSE: Record<StatusAgendamento, string> = {
  AGENDADO: estilos.agendado,
  EM_ANDAMENTO: estilos.andamento,
  CONCLUIDO: estilos.concluido,
  CANCELADO: estilos.cancelado,
};

export function StatusBadge({ status }: { status: StatusAgendamento }) {
  return (
    <span className={`${estilos.badge} ${CLASSE[status]}`}>
      <span className={estilos.bolinha} aria-hidden="true" />
      {ROTULO_STATUS[status]}
    </span>
  );
}