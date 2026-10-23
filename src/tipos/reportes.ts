// Formas de las respuestas del listado de estudiantes (contrato 7.2) y del
// reporte de progreso (contrato 8b.1), exclusivos del docente.
import type { EstadoModuloRuta } from "./aprendizaje";

export interface ResumenRutaEstudiante {
  idRuta: number;
  fechaAsignacion: string;
  progreso: number;
  totalModulos: number;
  modulosCompletados: number;
}

export interface EstudianteListado {
  idUsuario: number;
  nombre: string;
  correo: string;
  fechaRegistro: string;
  ruta: ResumenRutaEstudiante | null;
}

export interface ActividadReporte {
  idActividad: number;
  descripcion: string;
  fechaCompletada: string | null;
}

export interface ActividadesReporte {
  completadas: number;
  total: number;
  detalle: ActividadReporte[];
}

export interface EvaluacionReporte {
  idEvaluacion: number;
  titulo: string;
  mejorNota: number | null;
  intentos: number;
  intentosMaximos: number;
  aprobada: boolean;
}

export interface ModuloReporte {
  idModulo: number;
  nombre: string;
  ordenSecuencia: number;
  estado: EstadoModuloRuta;
  fechaInicio: string | null;
  actividades: ActividadesReporte;
  evaluacion: EvaluacionReporte | null;
}

export interface RutaReporte {
  idRuta: number;
  fechaAsignacion: string;
  progreso: number;
  modulos: ModuloReporte[];
}

export interface ReporteProgresoEstudiante {
  idUsuario: number;
  nombre: string;
  correo: string;
  fechaRegistro: string;
  ruta: RutaReporte | null;
}

export type FormatoExportacion = "csv" | "pdf";
