// Resumen de los servicios del usuario en el panel principal: conteo por
// estado, los primeros servicios con su imagen, puerto y recursos, y un estado
// vacio que invita a crear el primero (DT-17).
// Cubre: RF-16, RF-17, RNF-05 — CU-08
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Server } from "lucide-react";
import { EnlaceBoton } from "@/componentes-comunes/enlace-boton";
import { InsigniaEstado } from "@/componentes-comunes/insignia-estado";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import { useServicios } from "@/modulos/servicios/hooks/use-servicios";
import { formatearMegabytes, formatearNucleos } from "@/utilidades/formatear-capacidad";
import type { EstadoServicio, Servicio } from "@/tipos/servicio";

const LIMITE_SERVICIOS = 5;

const CLASES_PUNTO: Record<EstadoServicio, string> = {
  configurado: "bg-estado-configurado",
  desplegando: "bg-estado-desplegando",
  en_ejecucion: "bg-estado-en-ejecucion",
  detenido: "bg-estado-detenido",
  reiniciando: "bg-estado-reiniciando",
  fallido: "bg-estado-fallido",
  eliminado: "bg-estado-eliminado",
};

function conPlural(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

function Etiqueta({ children }: { children: string }) {
  return (
    <span className="rounded-md bg-fondo px-sm py-xs font-mono text-xs text-texto-secundario">
      {children}
    </span>
  );
}

function FilaServicio({ servicio }: { servicio: Servicio }) {
  const { configuracion } = servicio;
  const puerto = configuracion?.puertos[0];

  return (
    <li className="flex flex-wrap items-center justify-between gap-sm px-lg py-md">
      <div className="flex items-center gap-sm">
        <span
          aria-hidden="true"
          className={`h-2 w-2 shrink-0 rounded-completo ${CLASES_PUNTO[servicio.estado]}`}
        />
        <div className="flex flex-col">
          <Link
            to={`/servicios/${servicio.idServicio}`}
            className="font-medium text-texto hover:text-primario hover:underline"
          >
            {servicio.nombre}
          </Link>
          {configuracion ? (
            <span className="font-mono text-xs text-texto-secundario">
              {configuracion.imagenDocker}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-sm">
        <InsigniaEstado estado={servicio.estado} />
        {puerto ? <Etiqueta>{`:${puerto.host}`}</Etiqueta> : null}
        {configuracion ? (
          <>
            <Etiqueta>{`${formatearNucleos(configuracion.cpuAsignado)} CPU`}</Etiqueta>
            <Etiqueta>{formatearMegabytes(configuracion.memoriaAsignada)}</Etiqueta>
          </>
        ) : null}
      </div>
    </li>
  );
}

function ResumenConteo({ servicios }: { servicios: Servicio[] }) {
  const activos = servicios.filter((s) => s.estado === "en_ejecucion").length;
  const detenidos = servicios.filter((s) => s.estado === "detenido").length;

  return (
    <p className="flex flex-wrap items-center gap-md text-sm text-texto-secundario">
      <span>{conPlural(servicios.length, "servicio", "servicios")}</span>
      <span className="inline-flex items-center gap-xs">
        <span aria-hidden="true" className="h-2 w-2 rounded-completo bg-estado-en-ejecucion" />
        <span>{conPlural(activos, "activo", "activos")}</span>
      </span>
      <span className="inline-flex items-center gap-xs">
        <span aria-hidden="true" className="h-2 w-2 rounded-completo bg-estado-detenido" />
        <span>{conPlural(detenidos, "detenido", "detenidos")}</span>
      </span>
    </p>
  );
}

function EstadoVacio() {
  return (
    <div className="flex flex-col items-center gap-sm px-lg py-xl text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primario-suave text-primario">
        <Server aria-hidden="true" className="h-6 w-6" />
      </span>
      <h3 className="font-semibold text-texto">Aún no tienes servicios</h3>
      <p className="max-w-sm text-sm text-texto-secundario">
        Crea tu primer servicio para desplegar un contenedor y verlo aparecer aquí con su estado y
        recursos.
      </p>
      <EnlaceBoton hacia="/servicios/nuevo" icono={Plus}>
        Crear mi primer servicio
      </EnlaceBoton>
    </div>
  );
}

export function TarjetaMisServicios() {
  const { data: servicios, isLoading, isError } = useServicios();
  const tieneServicios = Boolean(servicios && servicios.length > 0);

  return (
    <Tarjeta
      titulo="Mis servicios"
      subtitulo={tieneServicios && servicios ? <ResumenConteo servicios={servicios} /> : null}
      acciones={
        tieneServicios ? (
          <EnlaceBoton hacia="/servicios/nuevo" icono={Plus}>
            Crear servicio
          </EnlaceBoton>
        ) : null
      }
    >
      {isLoading ? (
        <p role="status" aria-label="Cargando servicios" className="px-lg py-md text-texto-secundario">
          Cargando servicios...
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="px-lg py-md text-peligro">
          No fue posible cargar tus servicios.
        </p>
      ) : null}

      {servicios && servicios.length === 0 ? <EstadoVacio /> : null}

      {servicios && tieneServicios ? (
        <>
          <ul className="divide-y divide-borde">
            {servicios.slice(0, LIMITE_SERVICIOS).map((servicio) => (
              <FilaServicio key={servicio.idServicio} servicio={servicio} />
            ))}
          </ul>
          <div className="border-t border-borde bg-fondo px-lg py-sm text-center">
            <Link
              to="/servicios"
              className="inline-flex items-center gap-xs text-sm font-medium text-primario hover:underline"
            >
              Ver todos mis servicios
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </>
      ) : null}
    </Tarjeta>
  );
}
