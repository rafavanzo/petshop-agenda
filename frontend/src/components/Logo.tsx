import estilos from './Logo.module.css';

export function Logo({ grande = false }: { grande?: boolean }) {
  return (
    <div className={`${estilos.logo} ${grande ? estilos.grande : ''}`}>
      <span className={estilos.icone} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="10.5" r="2" />
          <circle cx="9.5" cy="5.5" r="2" />
          <circle cx="14.5" cy="5.5" r="2" />
          <circle cx="18.5" cy="10.5" r="2" />
          <path d="M12 12.5c-3 0-6 3.5-6 6 0 1.7 1.3 2.5 3 2.5 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.7 0 3-.8 3-2.5 0-2.5-3-6-6-6z" />
        </svg>
      </span>
      <span className={estilos.nome}>Patinha Limpa</span>
    </div>
  );
}