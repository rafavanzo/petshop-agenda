import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthProvider';
import { RotaProtegida } from './auth/RotaProtegida';
import { Layout } from './components/Layout';
import { Agenda } from './pages/agenda/Agenda';
import { Login } from './pages/Login';
import { Pets } from './pages/Pets';
import { Usuarios } from './pages/Usuarios';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Tudo aqui dentro exige login */}
          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route index element={<Agenda />} />
              <Route path="pets" element={<Pets />} />

              {/* E aqui dentro, também ser gerente */}
              <Route element={<RotaProtegida perfis={['GERENTE']} />}>
                <Route path="usuarios" element={<Usuarios />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}