import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { obtenerToken, obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { IniciarSesionPage } from "@/modulos/sesion/paginas/iniciar-sesion.page";
import { RegistroPage } from "@/modulos/sesion/paginas/registro.page";
import { PerfilPage } from "@/modulos/sesion/paginas/perfil.page";
import { PanelPrincipalPage } from "@/modulos/principal/paginas/panel-principal.page";
import { PanelServiciosPage } from "@/modulos/servicios/paginas/panel-servicios.page";
import { CrearServicioPage } from "@/modulos/servicios/paginas/crear-servicio.page";
import { DetalleServicioPage } from "@/modulos/servicios/paginas/detalle-servicio.page";
import { CapacidadServidorPage } from "@/modulos/servicios/paginas/capacidad-servidor.page";
import { DisenoAutenticado } from "./diseno-autenticado";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

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

const ROLES_SERVICIOS = [ID_ROL_ESTUDIANTE, ID_ROL_DOCENTE];

export function Rutas() {
  return (
    <Routes>
      <Route path="/iniciar-sesion" element={<IniciarSesionPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route element={<GuardaAutenticacion />}>
        <Route element={<DisenoAutenticado />}>
          <Route path="/" element={<PanelPrincipalPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/capacidad-servidor" element={<CapacidadServidorPage />} />
          <Route element={<GuardaRol rolesPermitidos={ROLES_SERVICIOS} />}>
            <Route path="/servicios" element={<PanelServiciosPage />} />
            <Route path="/servicios/nuevo" element={<CrearServicioPage />} />
            <Route path="/servicios/:idServicio" element={<DetalleServicioPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
