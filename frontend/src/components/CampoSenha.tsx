import { useState } from 'react';
import estilos from './CampoSenha.module.css';

interface Props {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  erro?: string;
  dica?: string;
  autoFocus?: boolean;
}

export function CampoSenha({ id, rotulo, valor, aoMudar, erro, dica, autoFocus }: Props) {
  const [visivel, setVisivel] = useState(false);
  const idMensagem = `${id}-mensagem`;

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <div className={estilos.caixa}>
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          autoComplete="new-password"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          autoFocus={autoFocus}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro || dica ? idMensagem : undefined}
        />
        <button
          type="button"
          className={estilos.olho}
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visivel}
        >
          {visivel ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.6 3.7M6.6 6.6C4.4 8 2.9 10.1 2 12c1 2.5 5 7 10 7 1.9 0 3.6-.6 5-1.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {erro ? (
        <span id={idMensagem} className="campo-erro">{erro}</span>
      ) : (
        dica && <span id={idMensagem} className="campo-dica">{dica}</span>
      )}
    </div>
  );
}