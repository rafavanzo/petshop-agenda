// ======================= TIPOS =========================

export type Perfil = 'GERENTE' | 'FUNCIONARIO';
export type Especie = 'CACHORRO' | 'GATO';
export type Porte = 'PEQUENO' | 'MEDIO' | 'GRANDE';
export type Servico = 'BANHO' | 'TOSA';
export type StatusAgendamento = 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

// ==================== USUÁRIOS E LOGIN ====================

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

// ==================== PETS ====================

export interface Pet {
  id: number;
  nome: string;
  especie: Especie;
  raca: string | null;
  porte: Porte | null;
  observacoes: string | null;
  tutorNome: string;
  tutorTelefone: string;
  tutorEndereco: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ==================== AGENDAMENTOS ====================

export interface Agendamento {
  id: number;
  data: string; // "AAAA-MM-DD"
  hora: number; // 8 a 17
  servico: Servico;
  status: StatusAgendamento;
  observacoes: string | null;
  petId: number;
  pet: Pick<
    Pet,
    'id' | 'nome' | 'especie' | 'raca' | 'porte' | 'observacoes' | 'tutorNome' | 'tutorTelefone'
  >;
  criadoPor: { id: number; nome: string };
}

export interface HorarioAgenda {
  hora: number;
  passado: boolean;
  vagas: number;
  agendamentos: Agendamento[];
}

export interface AgendaDia {
  data: string;
  horarios: HorarioAgenda[];
}

export interface ResumoDia {
  data: string;
  total: number;
}
