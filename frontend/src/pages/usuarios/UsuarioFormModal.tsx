import { useId, useState, type FormEvent } from 'react';
import { api, mensagemDeErro } from '../../api/cliente';
import { CampoSenha } from '../../components/CampoSenha';
import { Modal } from '../../components/Modal';
import type { UsuarioDetalhe } from '../../types';

// Os três modos do formulário
export type ModoFormulario =
  | { tipo: 'criar' }
  | { tipo: 'nome'; usuario: UsuarioDetalhe }
  | { tipo: 'senha'; usuario: UsuarioDetalhe };

interface Props {
  modo: ModoFormulario | null; // null = fechado
  aoFechar: () => void;
  aoConcluir: (mensagem: string) => void;
}

function tituloDo(modo: ModoFormulario | null) {
  if (!modo) return '';
  if (modo.tipo === 'criar') return 'Novo funcionário';
  if (modo.tipo === 'nome') return 'Editar nome';
  return `Redefinir senha de ${modo.usuario.nome}`;
}

export function UsuarioFormModal({ modo, aoFechar, aoConcluir }: Props) {
  return (
    <Modal aberto={modo !== null} titulo={tituloDo(modo)} aoFechar={aoFechar}>
      {modo && <Formulario modo={modo} aoCancelar={aoFechar} aoConcluir={aoConcluir} />}
    </Modal>
  );
}

// ---------- Formulário ----------

// Mesma regra do backend (CriarUsuarioDto)
const USUARIO_VALIDO = /^[a-z0-9._]{3,30}$/;

type Campo = 'nome' | 'login' | 'senha' | 'confirmacao';

function Formulario({
  modo,
  aoCancelar,
  aoConcluir,
}: {
  modo: ModoFormulario;
  aoCancelar: () => void;
  aoConcluir: (mensagem: string) => void;
}) {
  const id = useId();
  const pedeNome = modo.tipo !== 'senha';
  const pedeLogin = modo.tipo === 'criar';
  const pedeSenha = modo.tipo !== 'nome';

  const [nome, setNome] = useState(modo.tipo === 'nome' ? modo.usuario.nome : '');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function limparErro(campo: Campo) {
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function validar() {
    const e: Partial<Record<Campo, string>> = {};
    if (pedeNome && !nome.trim()) e.nome = 'Informe o nome';
    if (pedeLogin && !USUARIO_VALIDO.test(login)) {
      e.login = 'De 3 a 30 caracteres: letras minúsculas, números, ponto ou underline';
    }
    if (pedeSenha && senha.length < 8) e.senha = 'A senha deve ter no mínimo 8 caracteres';
    if (pedeSenha && confirmacao !== senha) e.confirmacao = 'As senhas não conferem';
    return e;
  }

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setErroGeral(null);
    setEnviando(true);
    try {
      if (modo.tipo === 'criar') {
        const criado = await api<UsuarioDetalhe>('/usuarios', {
          metodo: 'POST',
          corpo: { nome: nome.trim(), usuario: login, senha },
        });
        aoConcluir(`Funcionário ${criado.nome} criado. Ele(a) entra com o usuário "${criado.usuario}".`);
      } else if (modo.tipo === 'nome') {
        await api(`/usuarios/${modo.usuario.id}`, { metodo: 'PATCH', corpo: { nome: nome.trim() } });
        aoConcluir('Nome atualizado.');
      } else {
        await api(`/usuarios/${modo.usuario.id}/senha`, { metodo: 'PATCH', corpo: { senha } });
        aoConcluir(
          `Senha de ${modo.usuario.nome} redefinida. Se ele(a) estava logado(a), foi desconectado(a).`,
        );
      }
    } catch (e) {
      setErroGeral(mensagemDeErro(e)); // ex.: 409 "Este nome de usuário já está em uso"
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {erroGeral && (
        <div className="alerta-erro" role="alert">
          {erroGeral}
        </div>
      )}

      {modo.tipo === 'senha' && (
        <p className="campo-dica" style={{ margin: 0, fontSize: 14 }}>
          Use isso quando o funcionário esquecer a senha. Combine a senha nova com ele(a) pessoalmente.
        </p>
      )}

      {pedeNome && (
        <label className="campo">
          Nome completo
          <input
            type="text"
            maxLength={100}
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              limparErro('nome');
            }}
            autoFocus
            aria-invalid={erros.nome ? true : undefined}
            aria-describedby={erros.nome ? `${id}-nome` : undefined}
          />
          {erros.nome && <span id={`${id}-nome`} className="campo-erro">{erros.nome}</span>}
        </label>
      )}

      {pedeLogin && (
        <label className="campo">
          Usuário (para entrar no sistema)
          <input
            type="text"
            autoComplete="off"
            maxLength={30}
            placeholder="Ex.: joao.silva"
            value={login}
            onChange={(e) => {
              // minúsculas e sem espaços, já enquanto digita
              setLogin(e.target.value.toLowerCase().replace(/\s+/g, ''));
              limparErro('login');
            }}
            aria-invalid={erros.login ? true : undefined}
            aria-describedby={`${id}-login`}
          />
          <span id={`${id}-login`} className={erros.login ? 'campo-erro' : 'campo-dica'}>
            {erros.login ?? 'Letras minúsculas, números, ponto ou underline'}
          </span>
        </label>
      )}

      {pedeSenha && (
        <>
          <CampoSenha
            id={`${id}-senha`}
            rotulo={modo.tipo === 'senha' ? 'Nova senha' : 'Senha inicial'}
            valor={senha}
            aoMudar={(v) => {
              setSenha(v);
              limparErro('senha');
            }}
            erro={erros.senha}
            dica="No mínimo 8 caracteres"
            autoFocus={modo.tipo === 'senha'}
          />
          <CampoSenha
            id={`${id}-confirmacao`}
            rotulo="Confirmar senha"
            valor={confirmacao}
            aoMudar={(v) => {
              setConfirmacao(v);
              limparErro('confirmacao');
            }}
            erro={erros.confirmacao}
          />
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
        <button type="button" className="botao botao-secundario" onClick={aoCancelar}>
          Voltar
        </button>
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando
            ? 'Salvando…'
            : modo.tipo === 'criar'
              ? 'Criar funcionário'
              : modo.tipo === 'nome'
                ? 'Salvar nome'
                : 'Redefinir senha'}
        </button>
      </div>
    </form>
  );
}