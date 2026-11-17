import type { Especie, Porte, Servico, StatusAgendamento } from './types';

export const ROTULO_ESPECIE: Record<Especie, string> = {
  CACHORRO: 'Cão',
  GATO: 'Gato',
};

export const ROTULO_PORTE: Record<Porte, string> = {
  PEQUENO: 'Pequeno',
  MEDIO: 'Médio',
  GRANDE: 'Grande',
};

export const ROTULO_SERVICO: Record<Servico, string> = {
  BANHO: 'Banho',
  TOSA: 'Tosa',
};

export const ROTULO_STATUS: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};