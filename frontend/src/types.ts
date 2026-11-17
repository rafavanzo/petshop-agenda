export type Perfil = 'GERENTE' | 'FUNCIONARIO';

export interface Usuario {
  id: number;
  nome: string;
  usuario: string;
  perfil: Perfil;
}

export interface RespostaLogin {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}