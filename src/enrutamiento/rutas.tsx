import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { obtenerToken, obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";

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
    </Routes>
  );
}
