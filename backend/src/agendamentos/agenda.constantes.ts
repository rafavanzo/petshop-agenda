export const FUSO_HORARIO = 'America/Sao_Paulo';
export const HORA_ABERTURA = 8;
export const HORA_FECHAMENTO = 18; // último slot começa às 17h
export const LIMITE_POR_HORARIO = 1;

// [8, 9, 10, ..., 17]
export const HORARIOS = Array.from(
  { length: HORA_FECHAMENTO - HORA_ABERTURA },
  (_, i) => HORA_ABERTURA + i,
);