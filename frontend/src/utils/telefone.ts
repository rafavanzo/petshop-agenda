// Mesma regra do backend: (19) 99876-5432 ou (19) 3456-7890
export const TELEFONE_VALIDO = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// Formata enquanto a pessoa digita: "19998765432" → "(19) 99876-5432"
export function mascaraTelefone(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11); // só números, no máximo 11

  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; // fixo
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; // celular
}