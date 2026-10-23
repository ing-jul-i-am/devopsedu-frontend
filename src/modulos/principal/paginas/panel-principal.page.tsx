// Panel principal: estado del entorno y del aprendizaje tras autenticarse.
// Reune los servicios del usuario, su ruta de aprendizaje (solo estudiante),
// la capacidad del servidor y accesos al monitoreo (DT-17, supera en parte a
// DT-05).
// Cubre: S-4.2.16, S-4.2.18 (panel principal) — RF-10, RF-16, RF-22, RNF-03 —
// CU-08, CU-13
import { Link } from "react-router-dom";
import { obtenerUsuario } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_ESTUDIANTE } from "@/tipos/roles";
import { TarjetaMisServicios } from "../componentes/tarjeta-mis-servicios";
import { TarjetaRutaAprendizaje } from "../componentes/tarjeta-ruta-aprendizaje";
import { TarjetaCapacidad } from "../componentes/tarjeta-capacidad";

const ACCESOS_MONITOREO = [
  {
    hacia: "/monitoreo/historico",
    titulo: "Histórico",
    descripcion: "Operaciones y despliegues registrados.",
  },
  {
    hacia: "/monitoreo/metricas",
    titulo: "Gráficas de métricas",
    descripcion: "Consumo de CPU y memoria en el tiempo.",
  },
];

export function PanelPrincipalPage() {
  const usuario = obtenerUsuario();
  const esEstudiante = usuario?.idRol === ID_ROL_ESTUDIANTE;

  return (
    <div className="flex flex-col gap-lg p-xl">
      <div className="flex flex-col gap-xs">
        <h1 className="text-3xl font-semibold text-texto">
          Bienvenido{usuario ? `, ${usuario.nombre}` : ""}
        </h1>
        <p className="text-texto-secundario">
          {esEstudiante
            ? "Este es el estado actual de tu entorno y tu avance de aprendizaje."
            : "Este es el estado actual de tu entorno."}
        </p>
      </div>

      <div className="grid gap-lg lg:grid-cols-3">
        <div className="flex flex-col gap-lg lg:col-span-2">
          <TarjetaMisServicios />
          <div className="grid gap-lg sm:grid-cols-2">
            {ACCESOS_MONITOREO.map((acceso) => (
              <Link
                key={acceso.hacia}
                to={acceso.hacia}
                className="flex flex-col gap-xs rounded-xl border border-borde bg-superficie px-lg py-md shadow-sm hover:bg-fondo"
              >
                <span className="font-semibold text-texto">{acceso.titulo}</span>
                <span className="text-sm text-texto-secundario">{acceso.descripcion}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-lg">
          {esEstudiante ? <TarjetaRutaAprendizaje /> : null}
          <TarjetaCapacidad />
        </div>
      </div>
    </div>
  );
}
