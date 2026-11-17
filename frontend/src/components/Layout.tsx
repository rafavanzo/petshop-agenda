import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/contexto';
import estilos from './Layout.module.css';
import { Logo } from './Logo';

export function Layout() {
  const { usuario, sair } = useAuth();

  const links = [
    { para: '/', rotulo: 'Agenda' },
    { para: '/pets', rotulo: 'Pets' },
    ...(usuario?.perfil === 'GERENTE' ? [{ para: '/usuarios', rotulo: 'Usuários' }] : []),
  ];

  return (
    <div className={estilos.pagina}>
      <header className={estilos.topo}>
        <div className={estilos.topoConteudo}>
          <Logo />

          <nav className={estilos.menu} aria-label="Menu principal">
            {links.map((link) => (
              <NavLink
                key={link.para}
                to={link.para}
                end
                className={({ isActive }) =>
                  isActive ? `${estilos.link} ${estilos.ativo}` : estilos.link
                }
              >
                {link.rotulo}
              </NavLink>
            ))}
          </nav>

          <div className={estilos.usuario}>
            <div className={estilos.usuarioInfo}>
              <strong>{usuario?.nome}</strong>
              <small>{usuario?.perfil === 'GERENTE' ? 'Gerente' : 'Funcionário'}</small>
            </div>
            <button type="button" className="botao botao-secundario" onClick={() => void sair()}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className={estilos.conteudo}>
        <Outlet />
      </main>
    </div>
  );
}