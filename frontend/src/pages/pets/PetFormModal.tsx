import { useState, type FormEvent } from 'react';
import { api, mensagemDeErro } from '../../api/cliente';
import { Modal } from '../../components/Modal';
import { ROTULO_ESPECIE, ROTULO_PORTE } from '../../rotulos';
import type { Especie, Pet, Porte } from '../../types';
import { mascaraTelefone, TELEFONE_VALIDO } from '../../utils/telefone';
import estilos from './PetFormModal.module.css';

interface Props {
  aberto: boolean;
  pet?: Pet; // com pet = editar; sem pet = cadastrar
  aoFechar: () => void;
  aoSalvar: (pet: Pet) => void;
}

export function PetFormModal({ aberto, pet, aoFechar, aoSalvar }: Props) {
  return (
    <Modal aberto={aberto} titulo={pet ? `Editar ${pet.nome}` : 'Novo pet'} aoFechar={aoFechar} largo>
      <Formulario pet={pet} aoCancelar={aoFechar} aoSalvar={aoSalvar} />
    </Modal>
  );
}

// ---------- Formulário ----------

interface Dados {
  nome: string;
  especie: Especie | '';
  raca: string;
  porte: Porte | '';
  observacoes: string;
  tutorNome: string;
  tutorTelefone: string;
  tutorEndereco: string;
}

type ErrosCampo = Partial<Record<keyof Dados, string>>;

const ESPECIES: Especie[] = ['CACHORRO', 'GATO'];
const PORTES: Porte[] = ['PEQUENO', 'MEDIO', 'GRANDE'];

function dadosIniciais(pet?: Pet): Dados {
  return {
    nome: pet?.nome ?? '',
    especie: pet?.especie ?? '',
    raca: pet?.raca ?? '',
    porte: pet?.porte ?? '',
    observacoes: pet?.observacoes ?? '',
    tutorNome: pet?.tutorNome ?? '',
    tutorTelefone: pet?.tutorTelefone ?? '',
    tutorEndereco: pet?.tutorEndereco ?? '',
  };
}

function validar(d: Dados): ErrosCampo {
  const erros: ErrosCampo = {};
  if (!d.nome.trim()) erros.nome = 'Informe o nome do pet';
  if (!d.especie) erros.especie = 'Escolha a espécie';
  if (!d.tutorNome.trim()) erros.tutorNome = 'Informe o nome do tutor';
  if (!TELEFONE_VALIDO.test(d.tutorTelefone)) {
    erros.tutorTelefone = 'Telefone incompleto. Ex.: (19) 99876-5432';
  }
  if (!d.tutorEndereco.trim()) erros.tutorEndereco = 'Informe o endereço do tutor';
  return erros;
}

function Formulario({
  pet,
  aoCancelar,
  aoSalvar,
}: {
  pet?: Pet;
  aoCancelar: () => void;
  aoSalvar: (pet: Pet) => void;
}) {
  const [dados, setDados] = useState<Dados>(() => dadosIniciais(pet));
  const [erros, setErros] = useState<ErrosCampo>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Altera um campo e apaga o erro dele
  function alterar<K extends keyof Dados>(campo: K, valor: Dados[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const encontrados = validar(dados);
    if (Object.keys(encontrados).length > 0) {
      setErros(encontrados);
      return;
    }

    const corpo = {
      nome: dados.nome.trim(),
      especie: dados.especie,
      raca: dados.raca.trim() || null, // vazio = apagar o campo
      porte: dados.porte || null,
      observacoes: dados.observacoes.trim() || null,
      tutorNome: dados.tutorNome.trim(),
      tutorTelefone: dados.tutorTelefone,
      tutorEndereco: dados.tutorEndereco.trim(),
    };

    setErroGeral(null);
    setEnviando(true);
    try {
      const salvo = pet
        ? await api<Pet>(`/pets/${pet.id}`, { metodo: 'PATCH', corpo })
        : await api<Pet>('/pets', { metodo: 'POST', corpo });
      aoSalvar(salvo);
    } catch (e) {
      setErroGeral(mensagemDeErro(e));
      setEnviando(false);
    }
  }

  // Props comuns de acessibilidade para um campo com erro
  const ajuda = (campo: keyof Dados) => ({
    'aria-invalid': erros[campo] ? true : undefined,
    'aria-describedby': erros[campo] ? `erro-${campo}` : undefined,
  });

  const mensagem = (campo: keyof Dados) =>
    erros[campo] && (
      <span id={`erro-${campo}`} className="campo-erro">
        {erros[campo]}
      </span>
    );

  return (
    <form className={estilos.formulario} onSubmit={aoEnviar} noValidate>
      {erroGeral && (
        <div className="alerta-erro" role="alert">
          {erroGeral}
        </div>
      )}

      <fieldset className={estilos.secao}>
        <legend>Pet</legend>

        <label className="campo">
          Nome *
          <input
            type="text"
            maxLength={60}
            value={dados.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            autoFocus
            {...ajuda('nome')}
          />
          {mensagem('nome')}
        </label>

        <div className="campo">
          <span id="rotulo-especie">Espécie *</span>
          <div className={estilos.opcoes} role="radiogroup" aria-labelledby="rotulo-especie" {...ajuda('especie')}>
            {ESPECIES.map((especie) => (
              <label
                key={especie}
                className={`${estilos.opcao} ${dados.especie === especie ? estilos.opcaoAtiva : ''}`}
              >
                <input
                  type="radio"
                  name="especie"
                  checked={dados.especie === especie}
                  onChange={() => alterar('especie', especie)}
                />
                {ROTULO_ESPECIE[especie]}
              </label>
            ))}
          </div>
          {mensagem('especie')}
        </div>

        <label className="campo">
          Raça
          <input
            type="text"
            maxLength={60}
            placeholder="Ex.: Shih Tzu, SRD"
            value={dados.raca}
            onChange={(e) => alterar('raca', e.target.value)}
          />
        </label>

        <label className="campo">
          Porte
          <select value={dados.porte} onChange={(e) => alterar('porte', e.target.value as Porte | '')}>
            <option value="">Não informado</option>
            {PORTES.map((porte) => (
              <option key={porte} value={porte}>
                {ROTULO_PORTE[porte]}
              </option>
            ))}
          </select>
        </label>

        <label className={`campo ${estilos.inteira}`}>
          Observações
          <textarea
            maxLength={500}
            placeholder="Ex.: tem medo de secador, morde quando mexem nas patas"
            value={dados.observacoes}
            onChange={(e) => alterar('observacoes', e.target.value)}
          />
          <span className="campo-dica">Aparece na agenda, junto do agendamento.</span>
        </label>
      </fieldset>

      <fieldset className={estilos.secao}>
        <legend>Tutor(a)</legend>

        <label className="campo">
          Nome *
          <input
            type="text"
            maxLength={100}
            value={dados.tutorNome}
            onChange={(e) => alterar('tutorNome', e.target.value)}
            {...ajuda('tutorNome')}
          />
          {mensagem('tutorNome')}
        </label>

        <label className="campo">
          Telefone *
          <input
            type="tel"
            inputMode="numeric"
            placeholder="(19) 99876-5432"
            value={dados.tutorTelefone}
            onChange={(e) => alterar('tutorTelefone', mascaraTelefone(e.target.value))}
            {...ajuda('tutorTelefone')}
          />
          {mensagem('tutorTelefone')}
        </label>

        <label className={`campo ${estilos.inteira}`}>
          Endereço *
          <input
            type="text"
            maxLength={200}
            placeholder="Rua, número - bairro, cidade"
            value={dados.tutorEndereco}
            onChange={(e) => alterar('tutorEndereco', e.target.value)}
            {...ajuda('tutorEndereco')}
          />
          {mensagem('tutorEndereco')}
        </label>
      </fieldset>

      <div className={estilos.acoes}>
        <span className="campo-dica">* obrigatório</span>
        <button type="button" className="botao botao-secundario" onClick={aoCancelar}>
          Voltar
        </button>
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? 'Salvando…' : pet ? 'Salvar alterações' : 'Cadastrar pet'}
        </button>
      </div>
    </form>
  );
}