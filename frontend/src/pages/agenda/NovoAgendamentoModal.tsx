import { useEffect, useState, type FormEvent } from 'react';
import { api, mensagemDeErro } from '../../api/cliente';
import { Modal } from '../../components/Modal';
import { ROTULO_ESPECIE, ROTULO_SERVICO } from '../../rotulos';
import type { Pet, Servico } from '../../types';
import { formatarDiaExtenso, formatarHora } from '../../utils/datas';
import estilos from './NovoAgendamentoModal.module.css';

interface Props {
  data: string;
  hora: number | null; // null = fechado
  aoFechar: () => void;
  aoCriado: () => void;
}

export function NovoAgendamentoModal({ data, hora, aoFechar, aoCriado }: Props) {
  return (
    <Modal aberto={hora !== null} titulo="Novo agendamento" aoFechar={aoFechar}>
      {hora !== null && (
        <Formulario data={data} hora={hora} aoCancelar={aoFechar} aoCriado={aoCriado} />
      )}
    </Modal>
  );
}

const SERVICOS: Servico[] = ['BANHO', 'TOSA'];

// Filtra pelo nome do pet ou do tutor, sem diferenciar maiúsculas
function filtrarPets(pets: Pet[], texto: string) {
  const termo = texto.trim().toLowerCase();
  if (!termo) return pets;
  return pets.filter(
    (p) => p.nome.toLowerCase().includes(termo) || p.tutorNome.toLowerCase().includes(termo),
  );
}

function Formulario({
  data,
  hora,
  aoCancelar,
  aoCriado,
}: {
  data: string;
  hora: number;
  aoCancelar: () => void;
  aoCriado: () => void;
}) {
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [busca, setBusca] = useState('');
  const [petId, setPetId] = useState('');
  const [servico, setServico] = useState<Servico>('BANHO');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api<Pet[]>('/pets')
      .then(setPets)
      .catch((e) => setErro(mensagemDeErro(e)));
  }, []);

  const filtrados = filtrarPets(pets ?? [], busca);

  function aoBuscar(texto: string) {
    setBusca(texto);
    const resultado = filtrarPets(pets ?? [], texto);

    if (texto.trim() && resultado.length === 1) {
      // Só um pet encontrado: já deixa selecionado
      setPetId(String(resultado[0].id));
    } else if (!resultado.some((p) => String(p.id) === petId)) {
      // O pet escolhido sumiu da lista: limpa a seleção
      setPetId('');
    }
  }

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!petId) {
      setErro('Escolha um pet');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await api('/agendamentos', {
        metodo: 'POST',
        corpo: {
          petId: Number(petId),
          data,
          hora,
          servico,
          observacoes: observacoes.trim() || undefined, // vazio não é enviado
        },
      });
      aoCriado();
    } catch (e) {
      setErro(mensagemDeErro(e));
      setEnviando(false);
    }
  }

  return (
    <form className={estilos.formulario} onSubmit={aoEnviar} noValidate>
      <p className={estilos.quando}>
        <strong>{formatarDiaExtenso(data)}</strong> às <strong>{formatarHora(hora)}</strong>
      </p>

      {erro && (
        <div className="alerta-erro" role="alert">
          {erro}
        </div>
      )}

      <label className="campo">
        Buscar pet ou tutor
        <input
          type="search"
          placeholder="Ex.: Meg ou Raquel"
          value={busca}
          onChange={(e) => aoBuscar(e.target.value)}
          autoFocus
        />
        {busca.trim() && pets && (
          <span className="campo-dica" aria-live="polite">
            {filtrados.length === 0
              ? 'Nenhum pet encontrado'
              : filtrados.length === 1
                ? `1 pet encontrado: ${filtrados[0].nome} (já selecionado)`
                : `${filtrados.length} pets encontrados, escolha abaixo`}
          </span>
        )}
      </label>

      <label className="campo">
        Pet
        <select value={petId} onChange={(e) => setPetId(e.target.value)} required>
          <option value="">
            {pets === null
              ? 'Carregando pets…'
              : filtrados.length > 0
                ? 'Selecione o pet'
                : 'Nenhum pet encontrado'}
          </option>
          {filtrados.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.nome} ({ROTULO_ESPECIE[pet.especie]}) · {pet.tutorNome}
            </option>
          ))}
        </select>
      </label>

      <fieldset className={estilos.servicos}>
        <legend>Serviço</legend>
        <div className={estilos.opcoes}>
          {SERVICOS.map((s) => (
            <label key={s} className={`${estilos.opcao} ${servico === s ? estilos.opcaoAtiva : ''}`}>
              <input
                type="radio"
                name="servico"
                value={s}
                checked={servico === s}
                onChange={() => setServico(s)}
              />
              {ROTULO_SERVICO[s]}
              <span className={estilos.duracao}>60 min</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="campo">
        Observações <span className="campo-dica">(opcional)</span>
        <textarea
          maxLength={500}
          placeholder="Ex.: tutor busca às 11h"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </label>

      <div className={estilos.acoes}>
        <button type="button" className="botao botao-secundario" onClick={aoCancelar}>
          Voltar
        </button>
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? 'Agendando…' : 'Agendar'}
        </button>
      </div>
    </form>
  );
}