import { FUSO_HORARIO } from './agenda.constantes';

// Data e hora atuais em Americana, independente do fuso da máquina
export function agoraEmSaoPaulo() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_HORARIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)!.value;

  return {
    data: `${valor('year')}-${valor('month')}-${valor('day')}`, // "2026-11-16"
    hora: Number(valor('hour')), // 8
  };
}

// O horário já começou ou já passou?
export function horarioJaPassou(
  dataISO: string,
  hora: number,
  agora = agoraEmSaoPaulo(),
) {
  return dataISO < agora.data || (dataISO === agora.data && hora <= agora.hora);
}

// "2026-11-20" → Date para salvar na coluna DATE
export function paraData(dataISO: string) {
  return new Date(`${dataISO}T00:00:00.000Z`);
}

// Date da coluna DATE → "2026-11-20"
export function paraISO(data: Date) {
  return data.toISOString().slice(0, 10);
}

// Troca o Date do agendamento por "AAAA-MM-DD" na resposta da API
export function formatar<T extends { data: Date }>(agendamento: T) {
  return { ...agendamento, data: paraISO(agendamento.data) };
}