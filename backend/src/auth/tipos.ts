import type { Perfil } from '../generated/prisma/client';

export interface JwtPayload {
  sub: number;
  sid: string;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  usuario: string;
  perfil: Perfil;
  sessaoId: string;
}