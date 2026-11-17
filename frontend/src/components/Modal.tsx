import { useEffect, useId, useRef, type ReactNode } from 'react';
import estilos from './Modal.module.css';

interface Props {
  aberto: boolean;
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
}

export function Modal({ aberto, titulo, aoFechar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog ref={ref} className={estilos.modal} onClose={aoFechar} aria-labelledby={idTitulo}>
      <div className={estilos.cabecalho}>
        <h2 id={idTitulo}>{titulo}</h2>
        <button type="button" className={estilos.fechar} aria-label="Fechar" onClick={aoFechar}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {/* Só monta o conteúdo aberto: o formulário começa limpo a cada abertura */}
      {aberto && children}
    </dialog>
  );
}