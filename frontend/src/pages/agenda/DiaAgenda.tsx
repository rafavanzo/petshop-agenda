import type { AgendaDia, Agendamento, StatusAgendamento } from '../../types';
import { formatarDiaExtenso, formatarHora } from '../../utils/datas';
import { CartaoAgendamento } from './CartaoAgendamento';
import estilos from './DiaAgenda.module.css';

interface Props {
  data: string;
  ehHoje: boolean;
  agenda: AgendaDia | null;
  carregando: boolean;
  erro: string | null;
  processandoId: number | null;
  aoAgendar: (hora: number) => void;
  aoMudarStatus: (agendamento: Agendamento, status: StatusAgendamento) => void;
}

export function DiaAgenda({ data, ehHoje, agenda, carregando, erro, processandoId, aoAgendar, aoMudarStatus }: Props) {
  const agendados = agenda?.horarios.reduce((soma, h) => soma + h.agendamentos.length, 0) ?? 0;
  const livres = agenda?.horarios.filter((h) => !h.passado && h.vagas > 0).length ?? 0;

  return (
    <section className={`cartao ${estilos.dia}`} aria-label="Horários do dia" aria-busy={carregando}>
      <header className={estilos.cabecalho}>
        <div>
          {ehHoje && <span className={estilos.sobretitulo}>Hoje</span>}
          <h2>{formatarDiaExtenso(data)}</h2>
        </div>
        {agenda && (
          <span className={estilos.resumo}>
            {agendados} {agendados === 1 ? 'agendado' : 'agendados'} · {livres}{' '}
            {livres === 1 ? 'livre' : 'livres'}
          </span>
        )}
      </header>

      {erro && (
        <div className="alerta-erro" role="alert">
          {erro}
        </div>
      )}

      {!agenda && carregando && <p className={estilos.aviso}>Carregando horários…</p>}

      {agenda && (
        <ol className={estilos.lista}>
          {agenda.horarios.map((horario) => (
            <li key={horario.hora} className={estilos.linha}>
              <span className={estilos.hora}>{formatarHora(horario.hora)}</span>

              <div className={estilos.conteudo}>
                {horario.agendamentos.map((agendamento) => (
                  <CartaoAgendamento
                    key={agendamento.id}
                    agendamento={agendamento}
                    processando={processandoId === agendamento.id}
                    aoMudarStatus={aoMudarStatus}
                  />
                ))}

                {horario.vagas > 0 && !horario.passado && (
                  <button type="button" className={estilos.livre} onClick={() => aoAgendar(horario.hora)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Horário livre · agendar
                  </button>
                )}

                {horario.passado && horario.agendamentos.length === 0 && (
                  <span className={estilos.encerrado}>Horário encerrado</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}