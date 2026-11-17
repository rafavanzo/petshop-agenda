import { FotoPet } from '../../components/FotoPet';
import { StatusBadge } from '../../components/StatusBadge';
import { ROTULO_ESPECIE, ROTULO_SERVICO } from '../../rotulos';
import type { Agendamento, StatusAgendamento } from '../../types';
import estilos from './CartaoAgendamento.module.css';

// Os botões que aparecem em cada status (espelha o TRANSICOES do backend)
const ACOES: Record<StatusAgendamento, { status: StatusAgendamento; rotulo: string; classe: string }[]> = {
  AGENDADO: [
    { status: 'EM_ANDAMENTO', rotulo: 'Iniciar', classe: 'botao-primario' },
    { status: 'CANCELADO', rotulo: 'Cancelar', classe: 'botao-perigo' },
  ],
  EM_ANDAMENTO: [{ status: 'CONCLUIDO', rotulo: 'Concluir', classe: 'botao-primario' }],
  CONCLUIDO: [],
  CANCELADO: [],
};

interface Props {
  agendamento: Agendamento;
  processando: boolean;
  aoMudarStatus: (agendamento: Agendamento, status: StatusAgendamento) => void;
}

export function CartaoAgendamento({ agendamento, processando, aoMudarStatus }: Props) {
  const { pet } = agendamento;
  const acoes = ACOES[agendamento.status];

  return (
    <article className={estilos.cartao}>
      <div className={estilos.info}>
        <FotoPet nome={pet.nome} foto={pet.foto} tamanho={44} />
        <div className={estilos.textos}>
          <span className={estilos.nome}>
            {pet.nome}
            <span className={estilos.detalhe}>
              {' '}· {ROTULO_ESPECIE[pet.especie]}
              {pet.raca && ` · ${pet.raca}`}
            </span>
          </span>
          <span className={estilos.linha}>
            <strong>{ROTULO_SERVICO[agendamento.servico]}</strong> · Tutor(a): {pet.tutorNome} ·{' '}
            {pet.tutorTelefone}
          </span>
          {(agendamento.observacoes || pet.observacoes) && (
            <span className={estilos.observacao}>
              {agendamento.observacoes ?? pet.observacoes}
            </span>
          )}
        </div>
      </div>

      <div className={estilos.lado}>
        <StatusBadge status={agendamento.status} />
        {acoes.length > 0 && (
          <div className={estilos.acoes}>
            {acoes.map((acao) => (
              <button
                key={acao.status}
                type="button"
                className={`botao botao-pequeno ${acao.classe}`}
                disabled={processando}
                onClick={() => aoMudarStatus(agendamento, acao.status)}
              >
                {acao.rotulo}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}