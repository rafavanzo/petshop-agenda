const FUSO = 'America/Sao_Paulo';

// "Hoje" em Americana, no formato "AAAA-MM-DD"
export function hojeISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// "AAAA-MM-DD" → Date à meia-noite UTC (só para formatar/calcular)
function paraDataUTC(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// "2026-11-16" → "Segunda-feira, 16 de novembro"
export function formatarDiaExtenso(iso: string) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(paraDataUTC(iso));
  return capitalizar(texto);
}

// (2026, 11) → "Novembro de 2026"
export function nomeDoMes(ano: number, mes: number) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(ano, mes - 1, 1)));
  return capitalizar(texto);
}

// (2026, 11, 5) → "2026-11-05"
export function montarISO(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// Em que dia da semana o mês começa (0 = domingo) e quantos dias ele tem
export function estruturaDoMes(ano: number, mes: number) {
  return {
    primeiroDiaSemana: new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay(),
    totalDias: new Date(Date.UTC(ano, mes, 0)).getUTCDate(), // dia 0 do mês seguinte = último dia deste
  };
}

// 9 → "09:00"
export function formatarHora(hora: number) {
  return `${String(hora).padStart(2, '0')}:00`;
}