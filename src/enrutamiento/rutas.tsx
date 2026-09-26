import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { obtenerToken, obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { IniciarSesionPage } from "@/modulos/sesion/paginas/iniciar-sesion.page";
import { RegistroPage } from "@/modulos/sesion/paginas/registro.page";
import { PerfilPage } from "@/modulos/sesion/paginas/perfil.page";
import { PanelPrincipalPage } from "@/modulos/principal/paginas/panel-principal.page";
import { PanelServiciosPage } from "@/modulos/servicios/paginas/panel-servicios.page";
import { CrearServicioPage } from "@/modulos/servicios/paginas/crear-servicio.page";
import { DetalleServicioPage } from "@/modulos/servicios/paginas/detalle-servicio.page";
import { EditarConfiguracionPage } from "@/modulos/servicios/paginas/editar-configuracion.page";
import { CapacidadServidorPage } from "@/modulos/servicios/paginas/capacidad-servidor.page";
import { HistoricoOperacionesPage } from "@/modulos/monitoreo/paginas/historico-operaciones.page";
import { GraficasMetricasPage } from "@/modulos/monitoreo/paginas/graficas-metricas.page";
import { MiRutaPage } from "@/modulos/aprendizaje/paginas/mi-ruta.page";
import { ModuloAprendizajePage } from "@/modulos/aprendizaje/paginas/modulo-aprendizaje.page";
import { EvaluacionModuloPage } from "@/modulos/aprendizaje/paginas/evaluacion-modulo.page";
import { PanelModulosPage } from "@/modulos/administracion/paginas/panel-modulos.page";
import { CrearModuloPage } from "@/modulos/administracion/paginas/crear-modulo.page";
import { EditarModuloPage } from "@/modulos/administracion/paginas/editar-modulo.page";
import { GestionEstudiantesPage } from "@/modulos/administracion/paginas/gestion-estudiantes.page";
import { DisenoAutenticado } from "./diseno-autenticado";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

export function GuardaAutenticacion() {
  const ubicacion = useLocation();
  if (!obtenerToken()) {
    return <Navigate to="/iniciar-sesion" state={{ desde: ubicacion }} replace />;
  }
  return <Outlet />;
}

export function GuardaInvitado() {
  if (obtenerToken()) {
    return <Navigate to="/" replace />;
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
const ROLES_APRENDIZAJE_ESTUDIANTE = [ID_ROL_ESTUDIANTE];
const ROLES_ADMINISTRACION_DOCENTE = [ID_ROL_DOCENTE];

export function Rutas() {
  return (
    <Routes>
      <Route element={<GuardaInvitado />}>
        <Route path="/iniciar-sesion" element={<IniciarSesionPage />} />
        <Route path="/registro" element={<RegistroPage />} />
      </Route>
      <Route element={<GuardaAutenticacion />}>
        <Route element={<DisenoAutenticado />}>
          <Route path="/" element={<PanelPrincipalPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/capacidad-servidor" element={<CapacidadServidorPage />} />
          <Route element={<GuardaRol rolesPermitidos={ROLES_SERVICIOS} />}>
            <Route path="/servicios" element={<PanelServiciosPage />} />
            <Route path="/servicios/nuevo" element={<CrearServicioPage />} />
            <Route path="/servicios/:idServicio" element={<DetalleServicioPage />} />
            <Route
              path="/servicios/:idServicio/configuracion"
              element={<EditarConfiguracionPage />}
            />
            <Route path="/monitoreo/historico" element={<HistoricoOperacionesPage />} />
            <Route path="/monitoreo/metricas" element={<GraficasMetricasPage />} />
          </Route>
          <Route element={<GuardaRol rolesPermitidos={ROLES_APRENDIZAJE_ESTUDIANTE} />}>
            <Route path="/aprendizaje/mi-ruta" element={<MiRutaPage />} />
            <Route path="/aprendizaje/modulos/:idModulo" element={<ModuloAprendizajePage />} />
            <Route
              path="/aprendizaje/modulos/:idModulo/evaluacion"
              element={<EvaluacionModuloPage />}
            />
          </Route>
          <Route element={<GuardaRol rolesPermitidos={ROLES_ADMINISTRACION_DOCENTE} />}>
            <Route path="/administracion/modulos" element={<PanelModulosPage />} />
            <Route path="/administracion/modulos/nuevo" element={<CrearModuloPage />} />
            <Route path="/administracion/modulos/:idModulo" element={<EditarModuloPage />} />
            <Route path="/administracion/estudiantes" element={<GestionEstudiantesPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
