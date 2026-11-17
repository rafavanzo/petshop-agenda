import { useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../../api/cliente';
import { ROTULO_SERVICO } from '../../rotulos';
import type { AgendaDia, Agendamento, ResumoDia, StatusAgendamento } from '../../types';
import { formatarHora, hojeISO } from '../../utils/datas';
import estilos from './Agenda.module.css';
import { Calendario } from './Calendario';
import { DiaAgenda } from './DiaAgenda';
import { NovoAgendamentoModal } from './NovoAgendamentoModal';

interface EstadoDia {
  chave: string;
  agenda: AgendaDia | null;
  erro: string | null;
}

export function Agenda() {
  const hoje = hojeISO();

  const [selecionado, setSelecionado] = useState(hoje);
  const [ano, setAno] = useState(Number(hoje.slice(0, 4)));
  const [mes, setMes] = useState(Number(hoje.slice(5, 7)));
  const [versao, setVersao] = useState(0); // incrementar = recarregar os dados

  const [resumo, setResumo] = useState<ResumoDia[]>([]);
  const [dia, setDia] = useState<EstadoDia>({ chave: '', agenda: null, erro: null });

  const [horaNovoAgendamento, setHoraNovoAgendamento] = useState<number | null>(null);
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const recarregar = () => setVersao((v) => v + 1);

  // ---------- Resumo do mês (calendário) ----------
  useEffect(() => {
    let ativo = true;
    api<ResumoDia[]>(`/agendamentos/mes?ano=${ano}&mes=${mes}`)
      .then((r) => ativo && setResumo(r))
      .catch(() => ativo && setResumo([]));
    return () => {
      ativo = false; // ignora a resposta se o mês mudou antes de ela chegar
    };
  }, [ano, mes, versao]);

  // ---------- Agenda do dia ----------
  const chaveDia = `${selecionado}|${versao}`;
  useEffect(() => {
    let ativo = true;
    api<AgendaDia>(`/agendamentos/agenda?data=${selecionado}`)
      .then((agenda) => ativo && setDia({ chave: chaveDia, agenda, erro: null }))
      .catch((e) => ativo && setDia({ chave: chaveDia, agenda: null, erro: mensagemDeErro(e) }));
    return () => {
      ativo = false;
    };
  }, [selecionado, chaveDia]);

  // Derivados (não precisam de estado próprio)
  const carregandoDia = dia.chave !== chaveDia;
  const agendaVisivel = dia.agenda?.data === selecionado ? dia.agenda : null;

  // ---------- Ações ----------
  function mudarMes(delta: number) {
    const data = new Date(Date.UTC(ano, mes - 1 + delta, 1));
    setAno(data.getUTCFullYear());
    setMes(data.getUTCMonth() + 1);
  }

  function irParaHoje() {
    setSelecionado(hoje);
    setAno(Number(hoje.slice(0, 4)));
    setMes(Number(hoje.slice(5, 7)));
  }

  async function mudarStatus(agendamento: Agendamento, status: StatusAgendamento) {
    if (status === 'CANCELADO') {
      const confirmou = window.confirm(
        `Cancelar ${ROTULO_SERVICO[agendamento.servico].toLowerCase()} de ${agendamento.pet.nome} às ${formatarHora(agendamento.hora)}?`,
      );
      if (!confirmou) return;
    }

    setErroAcao(null);
    setProcessandoId(agendamento.id);
    try {
      await api(`/agendamentos/${agendamento.id}/status`, { metodo: 'PATCH', corpo: { status } });
      recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setProcessandoId(null);
    }
  }

  function aoCriarAgendamento() {
    setHoraNovoAgendamento(null);
    recarregar();
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.topo}>
        <h1>Agenda</h1>
        <button type="button" className="botao botao-secundario" onClick={irParaHoje}>
          Hoje
        </button>
      </div>

      {erroAcao && (
        <div className="alerta-erro" role="alert">
          {erroAcao}
        </div>
      )}

      <div className={estilos.colunas}>
        <Calendario
          ano={ano}
          mes={mes}
          hoje={hoje}
          selecionado={selecionado}
          resumo={resumo}
          aoSelecionar={setSelecionado}
          aoMudarMes={mudarMes}
        />
        <DiaAgenda
          data={selecionado}
          ehHoje={selecionado === hoje}
          agenda={agendaVisivel}
          carregando={carregandoDia}
          erro={dia.chave === chaveDia ? dia.erro : null}
          processandoId={processandoId}
          aoAgendar={setHoraNovoAgendamento}
          aoMudarStatus={mudarStatus}
        />
      </div>

      <NovoAgendamentoModal
        data={selecionado}
        hora={horaNovoAgendamento}
        aoFechar={() => setHoraNovoAgendamento(null)}
        aoCriado={aoCriarAgendamento}
      />
    </div>
  );
}