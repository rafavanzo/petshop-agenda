import { useEffect, useState } from 'react';

export function useDebounce<T>(valor: T, atrasoMs = 300) {
  const [valorAtrasado, setValorAtrasado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setValorAtrasado(valor), atrasoMs);
    return () => clearTimeout(timer); // digitou de novo? cancela o timer anterior
  }, [valor, atrasoMs]);

  return valorAtrasado;
}