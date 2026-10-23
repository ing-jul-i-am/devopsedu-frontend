// Detalle del progreso de un estudiante (contrato 8b.1): su ruta vigente y,
// por modulo, el estado, las actividades completadas y el resumen de la
// evaluacion (mejor nota, intentos y si aprobo). El estado se escribe siempre
// como texto ademas del color (RNF-05). Composicion de tarjeta y filas del
// panel principal (DT-17, DT-18).
// Cubre: RF-25, RNF-03, RNF-05 — CU-15
import { Link } from "react-router-dom";
import { ArrowLeft, CircleAlert, CircleCheck, Clock, Minus, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EnlaceBoton } from "@/componentes-comunes/enlace-boton";
import { Tarjeta } from "@/componentes-comunes/tarjeta";
import { normalizarErrorApi } from "@/infraestructura/errores-api";
import { InsigniaEstadoModulo } from "@/modulos/aprendizaje/componentes/insignia-estado-modulo";
import type { EvaluacionReporte, ModuloReporte, RutaReporte } from "@/tipos/reportes";
import { useReporteProgreso } from "../hooks/use-reporte-progreso";
import { ProgresoRutaEstudiante } from "./progreso-ruta-estudiante";

const TONOS = {
  exito: "border-exito-borde bg-exito-suave text-exito-texto",
  advertencia: "border-advertencia-borde bg-advertencia-suave text-advertencia-texto",
  neutro: "border-borde bg-fondo text-texto-secundario",
} as const;

function Etiqueta({ children }: { children: string }) {
  return (
    <span className="rounded-md bg-fondo px-sm py-xs text-xs text-texto-secundario">
      {children}
    </span>
  );
}

function describirEvaluacion(evaluacion: EvaluacionReporte | null): {
  texto: string;
  icono: LucideIcon;
  tono: keyof typeof TONOS;
} {
  if (!evaluacion) {
    return { texto: "Sin evaluación", icono: Minus, tono: "neutro" };
  }
  if (evaluacion.aprobada) {
    return { texto: "Aprobada", icono: CircleCheck, tono: "exito" };
  }
  if (evaluacion.mejorNota === null) {
    return { texto: "Sin presentar", icono: Clock, tono: "neutro" };
  }
  return { texto: "No aprobada", icono: CircleAlert, tono: "advertencia" };
}

function InsigniaEvaluacion({ evaluacion }: { evaluacion: EvaluacionReporte | null }) {
  const { texto, icono: Icono, tono } = describirEvaluacion(evaluacion);

  return (
    <span
      className={`inline-flex items-center gap-xs rounded-completo border px-sm py-xs text-xs font-medium ${TONOS[tono]}`}
    >
      <Icono aria-hidden="true" className="h-3 w-3" />
      {texto}
    </span>
  );
}

function FilaModulo({ modulo }: { modulo: ModuloReporte }) {
  const { actividades, evaluacion } = modulo;

  return (
    <li className="flex flex-col gap-sm px-lg py-md md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-sm">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-completo bg-primario-suave text-xs font-semibold text-primario">
          {modulo.ordenSecuencia}
        </span>
        <div className="flex flex-col">
          <span className="font-medium text-texto">{modulo.nombre}</span>
          {evaluacion ? (
            <span className="text-xs text-texto-secundario">{evaluacion.titulo}</span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-sm">
        <InsigniaEstadoModulo estado={modulo.estado} />
        <Etiqueta>{`Actividades ${actividades.completadas} de ${actividades.total}`}</Etiqueta>
        {evaluacion && evaluacion.mejorNota !== null ? (
          <Etiqueta>{`Mejor nota ${evaluacion.mejorNota}/100`}</Etiqueta>
        ) : null}
        {evaluacion ? (
          <Etiqueta>{`Intentos ${evaluacion.intentos} de ${evaluacion.intentosMaximos}`}</Etiqueta>
        ) : null}
        <InsigniaEvaluacion evaluacion={evaluacion} />
      </div>
    </li>
  );
}

function SinRuta() {
  return (
    <div className="flex flex-col items-center gap-sm px-lg py-xl text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primario-suave text-primario">
        <Route aria-hidden="true" className="h-6 w-6" />
      </span>
      <h3 className="font-semibold text-texto">Este estudiante no tiene una ruta asignada</h3>
      <p className="max-w-sm text-sm text-texto-secundario">
        Asígnale una ruta de aprendizaje para empezar a ver su progreso aquí.
      </p>
      <EnlaceBoton hacia="/administracion/estudiantes" icono={Route}>
        Asignar ruta
      </EnlaceBoton>
    </div>
  );
}

function Ruta({ nombreEstudiante, ruta }: { nombreEstudiante: string; ruta: RutaReporte }) {
  const modulos = [...ruta.modulos].sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
  const avance = {
    progreso: ruta.progreso,
    modulosCompletados: modulos.filter((modulo) => modulo.estado === "completado").length,
    totalModulos: modulos.length,
  };

  return (
    <>
      <div className="flex flex-col gap-xs border-b border-borde px-lg py-md">
        <ProgresoRutaEstudiante nombreEstudiante={nombreEstudiante} ruta={avance} />
        <p className="text-xs text-texto-secundario">
          Ruta asignada el {new Date(ruta.fechaAsignacion).toLocaleDateString("es-GT")}
        </p>
      </div>
      <ul className="divide-y divide-borde">
        {modulos.map((modulo) => (
          <FilaModulo key={modulo.idModulo} modulo={modulo} />
        ))}
      </ul>
    </>
  );
}

function VolverATodos() {
  return (
    <div className="border-t border-borde bg-fondo px-lg py-sm text-center">
      <Link
        to={{ search: "" }}
        className="inline-flex items-center gap-xs text-sm font-medium text-primario hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Volver a todos los estudiantes
      </Link>
    </div>
  );
}

export function DetalleProgresoEstudiante({ idUsuario }: { idUsuario: number }) {
  const { data: reporte, isLoading, isError, error } = useReporteProgreso(idUsuario);

  if (!reporte) {
    return (
      <Tarjeta titulo="Detalle del estudiante">
        {isLoading ? (
          <p
            role="status"
            aria-label="Cargando reporte del estudiante"
            className="px-lg py-md text-texto-secundario"
          >
            Cargando el reporte del estudiante...
          </p>
        ) : null}
        {isError ? (
          <p role="alert" className="px-lg py-md text-peligro">
            No fue posible cargar el reporte: {normalizarErrorApi(error).mensaje}
          </p>
        ) : null}
        {!isLoading && !isError ? (
          <p className="px-lg py-md text-texto-secundario">
            No se encontró el reporte de este estudiante.
          </p>
        ) : null}
        <VolverATodos />
      </Tarjeta>
    );
  }

  return (
    <Tarjeta
      titulo={reporte.nombre}
      subtitulo={
        <p className="text-sm text-texto-secundario">
          {reporte.correo} · Registrado el{" "}
          {new Date(reporte.fechaRegistro).toLocaleDateString("es-GT")}
        </p>
      }
    >
      {reporte.ruta ? <Ruta nombreEstudiante={reporte.nombre} ruta={reporte.ruta} /> : <SinRuta />}
      <VolverATodos />
    </Tarjeta>
  );
}
