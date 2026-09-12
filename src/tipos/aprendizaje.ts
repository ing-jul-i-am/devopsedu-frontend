// Formas del contrato de API para /api/modulos, /api/rutas y /api/aprendizaje
// (docs/contrato-api.md secciones 4, 5 y 6). Archivo de tipos puro, sin
// logica — no requiere TDD (CLAUDE.md seccion 7.2).

export type BloqueContenido =
  | { tipo: "texto"; contenido: string }
  | { tipo: "imagen"; url: string; textoAlternativo?: string }
  | { tipo: "enlace"; url: string; titulo: string; descripcion?: string }
  | { tipo: "actividad"; idActividad: number; descripcion?: string };

export interface Modulo {
  idModulo: number;
  nombre: string;
  contenido: BloqueContenido[];
  orden: number;
}

export interface CondicionesActividad {
  imagenDocker?: string;
  volumenesMinimos?: number;
  puertosMinimos?: number;
  cpuMinimo?: number;
  memoriaMinima?: number;
}

export interface CriteriosValidacionActividad {
  operacion: "desplegar" | "detener" | "reiniciar" | "eliminar";
  condiciones?: CondicionesActividad;
}

export interface Actividad {
  idActividad: number;
  descripcion: string;
  criteriosValidacion: CriteriosValidacionActividad;
  orden: number;
  idModulo: number;
}

export interface PreguntaEvaluacion {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
}

export interface Evaluacion {
  idEvaluacion: number;
  titulo: string;
  preguntas: PreguntaEvaluacion[];
  fechaDisponible: string;
  idModulo: number;
}

export interface ModuloRutaAsignada {
  idModulo: number;
  ordenSecuencia: number;
}

export interface RutaAsignada {
  idRuta: number;
  idUsuario: number;
  progreso: number;
  fechaAsignacion: string;
  modulos: ModuloRutaAsignada[];
}

export interface ModuloMiRuta {
  idModulo: number;
  nombre: string;
  ordenSecuencia: number;
}

export interface MiRuta {
  idRuta: number;
  progreso: number;
  fechaAsignacion: string;
  modulos: ModuloMiRuta[];
}

export interface ModuloConContenido {
  idModulo: number;
  nombre: string;
  orden: number;
  fechaInicio: string | null;
  contenido: BloqueContenido[];
}

export interface PreguntaEvaluacionEstudiante {
  pregunta: string;
  opciones: string[];
}

export interface EvaluacionEstudiante {
  idEvaluacion: number;
  titulo: string;
  fechaDisponible: string;
  preguntas: PreguntaEvaluacionEstudiante[];
}

export interface DetalleRespuestaEvaluacion {
  correcta: boolean;
}

export interface ResultadoEvaluacion {
  puntuacion: number;
  aprobado: boolean;
  intentosRestantes: number;
  detalle: DetalleRespuestaEvaluacion[];
}
