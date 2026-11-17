import { createContext, useContext } from 'react';
import type { Usuario } from '../types';

export interface ValorAuth {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (usuario: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

export const AuthContext = createContext<ValorAuth | null>(null);

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro do <AuthProvider>');
  return contexto;
}