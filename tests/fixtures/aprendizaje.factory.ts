import type {
  Actividad,
  Evaluacion,
  EvaluacionEstudiante,
  MiRuta,
  Modulo,
  ModuloConContenido,
} from "@/tipos/aprendizaje";

let contadorModulo = 0;

export function crearModuloDePrueba(sobreescrituras: Partial<Modulo> = {}): Modulo {
  contadorModulo += 1;
  return {
    idModulo: contadorModulo,
    nombre: `Modulo de prueba ${contadorModulo}`,
    contenido: [{ tipo: "texto", contenido: "Contenido de prueba." }],
    orden: contadorModulo,
    ...sobreescrituras,
  };
}

export function crearMiRutaDePrueba(sobreescrituras: Partial<MiRuta> = {}): MiRuta {
  return {
    idRuta: 1,
    progreso: 0,
    fechaAsignacion: "2026-08-28T00:00:00.000Z",
    modulos: [{ idModulo: 1, nombre: "Introduccion a contenedores", ordenSecuencia: 1 }],
    ...sobreescrituras,
  };
}

export function crearModuloConContenidoDePrueba(
  sobreescrituras: Partial<ModuloConContenido> = {}
): ModuloConContenido {
  return {
    idModulo: 1,
    nombre: "Introduccion a contenedores",
    orden: 1,
    fechaInicio: null,
    contenido: [{ tipo: "texto", contenido: "Los contenedores empaquetan una aplicacion." }],
    ...sobreescrituras,
  };
}

export function crearActividadDePrueba(sobreescrituras: Partial<Actividad> = {}): Actividad {
  return {
    idActividad: 1,
    descripcion: "Despliega un servicio con nginx",
    criteriosValidacion: { operacion: "desplegar" },
    orden: 1,
    idModulo: 1,
    ...sobreescrituras,
  };
}

export function crearEvaluacionDePrueba(sobreescrituras: Partial<Evaluacion> = {}): Evaluacion {
  return {
    idEvaluacion: 1,
    titulo: "Evaluacion: Redes en Docker",
    preguntas: [
      {
        pregunta: "Cual es la diferencia entre un volumen y un bind mount",
        opciones: ["Ninguna", "El volumen lo administra Docker", "El bind mount es mas rapido"],
        respuestaCorrecta: 1,
      },
    ],
    fechaDisponible: "2026-01-01T00:00:00.000Z",
    idModulo: 1,
    ...sobreescrituras,
  };
}

export function crearEvaluacionEstudianteDePrueba(
  sobreescrituras: Partial<EvaluacionEstudiante> = {}
): EvaluacionEstudiante {
  return {
    idEvaluacion: 1,
    titulo: "Evaluacion: Redes en Docker",
    fechaDisponible: "2026-01-01T00:00:00.000Z",
    preguntas: [
      {
        pregunta: "Cual es la diferencia entre un volumen y un bind mount",
        opciones: ["Ninguna", "El volumen lo administra Docker", "El bind mount es mas rapido"],
      },
    ],
    ...sobreescrituras,
  };
}
