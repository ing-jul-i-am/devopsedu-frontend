import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { obtenerToken, obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { IniciarSesionPage } from "@/modulos/sesion/paginas/iniciar-sesion.page";
import { RegistroPage } from "@/modulos/sesion/paginas/registro.page";
import { PerfilPage } from "@/modulos/sesion/paginas/perfil.page";

export function GuardaAutenticacion() {
  const ubicacion = useLocation();
  if (!obtenerToken()) {
    return <Navigate to="/iniciar-sesion" state={{ desde: ubicacion }} replace />;
  }
  return <Outlet />;
}

export function GuardaRol({ rolesPermitidos }: { rolesPermitidos: number[] }) {
  const usuario = obtenerUsuario();
  if (!usuario || !rolesPermitidos.includes(usuario.idRol)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<p>DevOpsEdu</p>} />
      <Route path="/iniciar-sesion" element={<IniciarSesionPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route element={<GuardaAutenticacion />}>
        <Route path="/perfil" element={<PerfilPage />} />
      </Route>
    </Routes>
  );
}
