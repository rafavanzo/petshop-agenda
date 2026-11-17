import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ErroApi } from '../api/cliente';
import { useAuth } from '../auth/contexto';
import { Logo } from '../components/Logo';
import estilos from './Login.module.css';

export function Login() {
  const { usuario, entrar } = useAuth();
  const navegar = useNavigate();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de ?? '/';

  const [nomeUsuario, setNomeUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Já está logado? Não faz sentido ver o login
  if (usuario) return <Navigate to={destino} replace />;

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); // impede o navegador de recarregar a página
    setErro(null);
    setEnviando(true);
    try {
      await entrar(nomeUsuario.trim(), senha);
      navegar(destino, { replace: true });
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.pagina}>
      <div className={`cartao ${estilos.cartao}`}>
        <Logo grande />

        <div className={estilos.cabecalho}>
          <h1>Entrar</h1>
          <p className={estilos.subtitulo}>Acesso dos funcionários ao sistema de banho e tosa.</p>
        </div>

        <form className={estilos.formulario} onSubmit={aoEnviar} noValidate>
          {erro && (
            <div className="alerta-erro" role="alert">
              {erro}
            </div>
          )}

          <label className="campo">
            Usuário
            <input
              type="text"
              autoComplete="username"
              autoFocus
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              required
            />
          </label>

          <label className="campo">
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="botao botao-primario"
            disabled={enviando || !nomeUsuario || !senha}
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}