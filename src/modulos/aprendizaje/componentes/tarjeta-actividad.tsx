// Tarjeta de una actividad practica dentro del contenido de un modulo. Su color
// indica si el estudiante ya la completo (verde) o sigue pendiente (amarillo);
// el estado tambien se comunica con texto para no depender solo del color
// (RNF-05). El estado proviene del contrato 6.1b (DT-18 del backend, DT-17).
// Cubre: RF-23, RNF-03, RNF-05 — CU-12
import { useId } from "react";
import { CircleCheck, Clock, FlaskConical } from "lucide-react";
import { EnlaceBoton } from "@/componentes-comunes/enlace-boton";
import type { BloqueActividadEstudiante } from "@/tipos/aprendizaje";

interface Props {
  actividad: BloqueActividadEstudiante;
  numero?: number | undefined;
}

const formatoFecha = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const ESTILOS = {
  pendiente: {
    tarjeta: "border-advertencia-borde",
    encabezado: "border-advertencia-borde bg-advertencia-suave text-advertencia-texto",
    insignia: "bg-superficie text-advertencia-texto",
  },
  completada: {
    tarjeta: "border-exito-borde",
    encabezado: "border-exito-borde bg-exito-suave text-exito-texto",
    insignia: "bg-superficie text-exito-texto",
  },
} as const;

export function TarjetaActividad({ actividad, numero }: Props) {
  const idTitulo = useId();
  const { completada, fechaCompletada, descripcion } = actividad;
  const estilos = completada ? ESTILOS.completada : ESTILOS.pendiente;
  const titulo = numero ? `Actividad práctica ${numero}` : "Actividad práctica";
  const IconoEstado = completada ? CircleCheck : Clock;

  return (
    <article
      aria-labelledby={idTitulo}
      className={`overflow-hidden rounded-xl border bg-superficie shadow-sm ${estilos.tarjeta}`}
    >
      <div
        className={`flex items-center justify-between gap-sm border-b px-md py-sm ${estilos.encabezado}`}
      >
        <span className="inline-flex items-center gap-xs text-xs font-semibold uppercase tracking-wide">
          <FlaskConical aria-hidden="true" className="h-4 w-4" />
          Práctica
        </span>
        <span
          className={`inline-flex items-center gap-xs rounded-completo px-sm py-xs text-xs font-medium ${estilos.insignia}`}
        >
          <IconoEstado aria-hidden="true" className="h-3 w-3" />
          {completada ? "Completada" : "Pendiente"}
        </span>
      </div>

      <div className="flex flex-col gap-sm p-md">
        <h3 id={idTitulo} className="font-semibold text-texto">
          {titulo}
        </h3>
        {descripcion ? (
          <p className="text-sm text-texto">{descripcion}</p>
        ) : (
          <p className="text-sm text-texto-secundario">
            La descripción de esta actividad no está disponible.
          </p>
        )}
        <p className="text-sm text-texto-secundario">
          {completada
            ? "Despliegue verificado con éxito."
            : "Despliega el servicio con los parámetros indicados para completar el módulo. La actividad se marca como completada automáticamente."}
        </p>
        {completada && fechaCompletada ? (
          <p className="text-xs text-texto-secundario">
            Completada el {formatoFecha.format(new Date(fechaCompletada))}
          </p>
        ) : null}
        <div className="pt-xs">
          {completada ? (
            <EnlaceBoton hacia="/servicios" variante="secundario">
              Ver mis servicios
            </EnlaceBoton>
          ) : (
            <EnlaceBoton hacia="/servicios">Ir a Mis servicios</EnlaceBoton>
          )}
        </div>
      </div>
    </article>
  );
}
