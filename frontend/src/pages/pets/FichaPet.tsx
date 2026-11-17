import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api, ErroApi, mensagemDeErro } from '../../api/cliente';
import { useAuth } from '../../auth/contexto';
import { StatusBadge } from '../../components/StatusBadge';
import { ROTULO_ESPECIE, ROTULO_PORTE, ROTULO_SERVICO } from '../../rotulos';
import type { Agendamento, Pet, PetComContagem } from '../../types';
import { formatarDataCurta, formatarHora } from '../../utils/datas';
import estilos from './FichaPet.module.css';
import { PetFormModal } from './PetFormModal';

interface Estado {
  chave: string;
  pet: PetComContagem | null;
  historico: Agendamento[];
  erro: string | null;
  naoEncontrado: boolean;
}

export function FichaPet() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAuth();

  const [versao, setVersao] = useState(0);
  const [editando, setEditando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const chave = `${id}|${versao}`;
  const [estado, setEstado] = useState<Estado>({
    chave: '',
    pet: null,
    historico: [],
    erro: null,
    naoEncontrado: false,
  });

  useEffect(() => {
    let ativo = true;
    // As duas buscas em paralelo: mais rápido do que uma depois da outra
    Promise.all([
      api<PetComContagem>(`/pets/${id}`),
      api<Agendamento[]>(`/agendamentos/pet/${id}`),
    ])
      .then(([pet, historico]) => {
        if (ativo) setEstado({ chave, pet, historico, erro: null, naoEncontrado: false });
      })
      .catch((e) => {
        if (!ativo) return;
        const naoEncontrado = e instanceof ErroApi && (e.status === 404 || e.status === 400);
        setEstado({ chave, pet: null, historico: [], erro: mensagemDeErro(e), naoEncontrado });
      });
    return () => {
      ativo = false;
    };
  }, [id, chave]);

  const carregando = estado.chave !== chave && !estado.pet;
  const { pet, historico } = estado;

  async function excluir() {
    if (!pet) return;
    if (!window.confirm(`Excluir ${pet.nome}? Essa ação não pode ser desfeita.`)) return;

    setErroAcao(null);
    setExcluindo(true);
    try {
      await api(`/pets/${pet.id}`, { metodo: 'DELETE' });
      navegar('/pets', { replace: true });
    } catch (e) {
      setErroAcao(mensagemDeErro(e)); // ex.: 409 "possui agendamentos no histórico"
      setExcluindo(false);
    }
  }

  function aoSalvar(_pet: Pet) {
    setEditando(false);
    setVersao((v) => v + 1);
  }

  if (carregando) return <p className={estilos.aviso}>Carregando ficha…</p>;

  if (!pet) {
    return (
      <div className={estilos.pagina}>
        <Link to="/pets" className={estilos.voltar}>← Voltar para pets</Link>
        <div className="alerta-erro" role="alert">
          {estado.naoEncontrado ? 'Pet não encontrado.' : estado.erro}
        </div>
      </div>
    );
  }

  const concluidos = historico.filter((a) => a.status === 'CONCLUIDO').length;

  return (
    <div className={estilos.pagina}>
      <Link to="/pets" className={estilos.voltar}>← Voltar para pets</Link>

      <div className={estilos.cabecalho}>
        <div className={estilos.identidade}>
          <span className={estilos.avatar} aria-hidden="true">{pet.nome.charAt(0)}</span>
          <div>
            <h1>{pet.nome}</h1>
            <div className={estilos.etiquetas}>
              <span className={estilos.etiqueta}>{ROTULO_ESPECIE[pet.especie]}</span>
              {pet.raca && <span className={estilos.etiqueta}>{pet.raca}</span>}
              {pet.porte && <span className={estilos.etiqueta}>Porte {ROTULO_PORTE[pet.porte].toLowerCase()}</span>}
            </div>
          </div>
        </div>

        <div className={estilos.acoes}>
          <button type="button" className="botao botao-secundario" onClick={() => setEditando(true)}>
            Editar
          </button>
          {usuario?.perfil === 'GERENTE' && (
            <button type="button" className="botao botao-perigo" onClick={excluir} disabled={excluindo}>
              {excluindo ? 'Excluindo…' : 'Excluir'}
            </button>
          )}
        </div>
      </div>

      {erroAcao && (
        <div className="alerta-erro" role="alert">
          {erroAcao}
        </div>
      )}

      <div className={estilos.grade}>
        <section className="cartao">
          <h2 className={estilos.tituloSecao}>Tutor(a)</h2>
          <dl className={estilos.dados}>
            <div>
              <dt>Nome</dt>
              <dd>{pet.tutorNome}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>
                <a href={`tel:+55${pet.tutorTelefone.replace(/\D/g, '')}`}>{pet.tutorTelefone}</a>
              </dd>
            </div>
            <div>
              <dt>Endereço</dt>
              <dd>{pet.tutorEndereco}</dd>
            </div>
          </dl>
        </section>

        <section className="cartao">
          <h2 className={estilos.tituloSecao}>Observações</h2>
          <p className={pet.observacoes ? estilos.observacao : estilos.semDado}>
            {pet.observacoes ?? 'Nenhuma observação cadastrada.'}
          </p>
          <div className={estilos.numeros}>
            <div>
              <strong>{pet._count.agendamentos}</strong>
              <span>agendamentos</span>
            </div>
            <div>
              <strong>{concluidos}</strong>
              <span>atendimentos concluídos</span>
            </div>
          </div>
        </section>
      </div>

      <section className="cartao">
        <h2 className={estilos.tituloSecao}>Histórico de atendimentos</h2>
        {historico.length === 0 ? (
          <p className={estilos.semDado}>Nenhum atendimento ainda. Agende pela tela de Agenda.</p>
        ) : (
          <ul className={estilos.historico}>
            {historico.map((a) => (
              <li key={a.id} className={estilos.itemHistorico}>
                <div className={estilos.quando}>
                  <strong>{formatarDataCurta(a.data)}</strong>
                  <span>{formatarHora(a.hora)}</span>
                </div>
                <div className={estilos.oque}>
                  <strong>{ROTULO_SERVICO[a.servico]}</strong>
                  <span>
                    Agendado por {a.criadoPor.nome}
                    {a.observacoes && ` · ${a.observacoes}`}
                  </span>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <PetFormModal aberto={editando} pet={pet} aoFechar={() => setEditando(false)} aoSalvar={aoSalvar} />
    </div>
  );
}