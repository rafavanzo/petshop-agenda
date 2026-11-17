import type { ResumoDia } from '../../types';
import { estruturaDoMes, montarISO, nomeDoMes } from '../../utils/datas';
import estilos from './Calendario.module.css';

// 10 horários × 1 vaga (mesma regra do backend)
const TOTAL_VAGAS_DIA = 10;
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  ano: number;
  mes: number;
  hoje: string;
  selecionado: string;
  resumo: ResumoDia[];
  aoSelecionar: (dataISO: string) => void;
  aoMudarMes: (delta: number) => void;
}

export function Calendario({ ano, mes, hoje, selecionado, resumo, aoSelecionar, aoMudarMes }: Props) {
  const { primeiroDiaSemana, totalDias } = estruturaDoMes(ano, mes);
  const totais = new Map(resumo.map((r) => [r.data, r.total]));

  // Espaços vazios antes do dia 1 + os dias do mês
  const celulas: (number | null)[] = [
    ...Array<null>(primeiroDiaSemana).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  return (
    <section className={`cartao ${estilos.calendario}`} aria-label="Calendário">
      <div className={estilos.cabecalho}>
        <h2>{nomeDoMes(ano, mes)}</h2>
        <div className={estilos.navegacao}>
          <button type="button" className={estilos.seta} aria-label="Mês anterior" onClick={() => aoMudarMes(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className={estilos.seta} aria-label="Próximo mês" onClick={() => aoMudarMes(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className={estilos.grade}>
        {SEMANA.map((dia) => (
          <span key={dia} className={estilos.diaSemana}>
            {dia}
          </span>
        ))}

        {celulas.map((dia, indice) => {
          if (dia === null) return <span key={`vazio-${indice}`} />;

          const iso = montarISO(ano, mes, dia);
          const total = totais.get(iso) ?? 0;
          const lotado = total >= TOTAL_VAGAS_DIA;
          const classes = [
            estilos.dia,
            iso < hoje && estilos.passado,
            iso === hoje && estilos.hoje,
            total > 0 && estilos.comAgendamento,
            iso === selecionado && estilos.selecionado,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={iso}
              type="button"
              className={classes}
              aria-pressed={iso === selecionado}
              aria-label={`${dia}${total > 0 ? (lotado ? ', lotado' : `, ${total} agendados`) : ''}`}
              onClick={() => aoSelecionar(iso)}
            >
              <span>{dia}</span>
              {total > 0 && (
                <span className={lotado ? estilos.lotado : estilos.contador}>
                  {lotado ? 'Lotado' : total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className={estilos.legenda}>O número mostra quantos pets estão agendados no dia.</p>
    </section>
  );
}