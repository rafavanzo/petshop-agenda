import { useState } from 'react';
import { urlDaFoto } from '../api/cliente';
import estilos from './FotoPet.module.css';

interface Props {
  nome: string;
  foto: string | null;
  tamanho?: number;
}

export function FotoPet({ nome, foto, tamanho = 40 }: Props) {
  // Guarda qual foto falhou ao carregar (ex.: arquivo apagado do disco)
  const [fotoComErro, setFotoComErro] = useState<string | null>(null);
  const estilo = { width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.4) };

  if (foto && foto !== fotoComErro) {
    return (
      <img
        src={urlDaFoto(foto)}
        alt="" // decorativa: o nome do pet já aparece ao lado
        className={estilos.foto}
        style={estilo}
        loading="lazy"
        onError={() => setFotoComErro(foto)}
      />
    );
  }

  return (
    <span className={estilos.inicial} style={estilo} aria-hidden="true">
      {nome.charAt(0).toUpperCase()}
    </span>
  );
}
