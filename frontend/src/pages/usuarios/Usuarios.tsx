import { useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../../api/cliente';
import { useAuth } from '../../auth/contexto';
import type { UsuarioDetalhe } from '../../types';
import { formatarInstante } from '../../utils/datas';
import { UsuarioFormModal, type ModoFormulario } from './UsuarioFormModal';
import estilos from './Usuarios.module.css';

interface Resultado {
  versao: number;
  lista: UsuarioDetalhe[];
  erro: string | null;
}

export function Usuarios() {
  const { usuario: eu } = useAuth();

  const [versao, setVersao] = useState(0);
  const [resultado, setResultado] = useState<Resultado>({ versao: -1, lista: [], erro: null });
  const [modo, setModo] = useState<ModoFormulario | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    api<UsuarioDetalhe[]>('/usuarios')
      .then((lista) => ativo && setResultado({ versao, lista, erro: null }))
      .catch((e) => ativo && setResultado({ versao, lista: [], erro: mensagemDeErro(e) }));
    return () => {
      ativo = false;
    };
  }, [versao]);

  const carregandoPrimeiraVez = resultado.versao === -1;
  const ativos = resultado.lista.filter((u) => u.ativo).length;

  function recarregar() {
    setVersao((v) => v + 1);
  }

  function abrir(novoModo: ModoFormulario) {
    setSucesso(null);
    setErroAcao(null);
    setModo(novoModo);
  }

  function aoConcluir(mensagem: string) {
    setModo(null);
    setSucesso(mensagem);
    recarregar();
  }

  async function alternarAtivo(alvo: UsuarioDetalhe) {
    const desativar = alvo.ativo;
    if (
      desativar &&
      !window.confirm(
        `Desativar ${alvo.nome}? Ele(a) será desconectado(a) na hora e não conseguirá mais entrar.`,
      )
    ) {
      return;
    }

    setSucesso(null);
    setErroAcao(null);
    setProcessandoId(alvo.id);
    try {
      await api(`/usuarios/${alvo.id}/${desativar ? 'desativar' : 'ativar'}`, { metodo: 'PATCH' });
      setSucesso(
        desativar
          ? `${alvo.nome} foi desativado(a) e desconectado(a).`
          : `${alvo.nome} foi reativado(a) e já pode entrar de novo.`,
      );
      recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.topo}>
        <div>
          <h1>Usuários</h1>
          <p className={estilos.contagem}>
            {carregandoPrimeiraVez
              ? 'Carregando…'
              : `${ativos} ${ativos === 1 ? 'ativo' : 'ativos'} de ${resultado.lista.length}`}
          </p>
        </div>
        <button type="button" className="botao botao-primario" onClick={() => abrir({ tipo: 'criar' })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo funcionário
        </button>
      </div>

      <div aria-live="polite">
        {sucesso && <div className="alerta-sucesso">{sucesso}</div>}
      </div>
      {(erroAcao || resultado.erro) && (
        <div className="alerta-erro" role="alert">
          {erroAcao ?? resultado.erro}
        </div>
      )}

      <div className={`cartao ${estilos.tabelaCaixa}`} aria-busy={carregandoPrimeiraVez}>
        <table className={estilos.tabela}>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Usuário</th>
              <th scope="col">Perfil</th>
              <th scope="col">Situação</th>
              <th scope="col">Desde</th>
              <th scope="col">
                <span className={estilos.somenteLeitor}>Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {resultado.lista.map((u) => {
              const souEu = u.id === eu?.id;
              return (
                <tr key={u.id} className={u.ativo ? undefined : estilos.inativo}>
                  <td>
                    <div className={estilos.pessoa}>
                      <span className={estilos.avatar} aria-hidden="true">
                        {u.nome.charAt(0)}
                      </span>
                      <span className={estilos.nome}>
                        {u.nome}
                        {souEu && <span className={estilos.voce}>Você</span>}
                      </span>
                    </div>
                  </td>
                  <td>
                    <code className={estilos.login}>{u.usuario}</code>
                  </td>
                  <td>
                    <span className={u.perfil === 'GERENTE' ? estilos.gerente : estilos.funcionario}>
                      {u.perfil === 'GERENTE' ? 'Gerente' : 'Funcionário'}
                    </span>
                  </td>
                  <td>
                    <span className={u.ativo ? estilos.ativo : estilos.desativado}>
                      <span className={estilos.bolinha} aria-hidden="true" />
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className={estilos.data}>{formatarInstante(u.criadoEm)}</td>
                  <td>
                    <div className={estilos.acoes}>
                      <button
                        type="button"
                        className="botao botao-secundario botao-pequeno"
                        onClick={() => abrir({ tipo: 'nome', usuario: u })}
                      >
                        Editar nome
                      </button>
                      {!souEu && (
                        <>
                          <button
                            type="button"
                            className="botao botao-secundario botao-pequeno"
                            onClick={() => abrir({ tipo: 'senha', usuario: u })}
                            disabled={!u.ativo}
                          >
                            Redefinir senha
                          </button>
                          <button
                            type="button"
                            className={`botao botao-pequeno ${u.ativo ? 'botao-perigo' : 'botao-primario'}`}
                            onClick={() => alternarAtivo(u)}
                            disabled={processandoId === u.id}
                          >
                            {u.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={estilos.nota}>
        Usuários não são excluídos, só desativados: o histórico da agenda guarda quem criou cada
        agendamento.
      </p>

      <UsuarioFormModal modo={modo} aoFechar={() => setModo(null)} aoConcluir={aoConcluir} />
    </div>
  );
}