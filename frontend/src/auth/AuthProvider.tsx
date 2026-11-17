import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, definirAoExpirarSessao, tokenStorage } from '../api/cliente';
import type { RespostaLogin, Usuario } from '../types';
import { AuthContext } from './contexto';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Se já existe token salvo, começa "carregando" até confirmar com o backend
  const [carregando, setCarregando] = useState(() => tokenStorage.obter() !== null);

  const limparSessao = useCallback(() => {
    tokenStorage.limpar();
    setUsuario(null);
  }, []);

  useEffect(() => {
    definirAoExpirarSessao(limparSessao);

    if (!tokenStorage.obter()) return;

    // Recarregou a página? Confere se o token salvo ainda vale
    api<Usuario>('/auth/me')
      .then(setUsuario)
      .catch(limparSessao)
      .finally(() => setCarregando(false));
  }, [limparSessao]);

  const entrar = useCallback(async (nomeUsuario: string, senha: string) => {
    const resposta = await api<RespostaLogin>('/auth/login', {
      metodo: 'POST',
      corpo: { usuario: nomeUsuario, senha },
    });
    tokenStorage.salvar(resposta.token);
    setUsuario(resposta.usuario);
  }, []);

  const sair = useCallback(async () => {
    await api('/auth/logout', { metodo: 'POST' }).catch(() => {
      // Mesmo se o backend falhar, o usuário sai no navegador
    });
    limparSessao();
  }, [limparSessao]);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, sair }),
    [usuario, carregando, entrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}