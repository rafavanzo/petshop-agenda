import { Navigate, Outlet, useLocation } from 'react-router';
import type { Perfil } from '../types';
import { useAuth } from './contexto';

export function RotaProtegida({ perfis }: { perfis?: Perfil[] }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <div className="carregando-tela">Carregando…</div>;

  if (!usuario) {
    // Guarda para onde a pessoa queria ir, para voltar depois do login
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  if (perfis && !perfis.includes(usuario.perfil)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}