import type {
  EstudianteListado,
  ModuloReporte,
  ReporteProgresoEstudiante,
} from "@/tipos/reportes";

let contadorEstudiante = 0;

export function crearEstudianteListadoDePrueba(
  sobreescrituras: Partial<EstudianteListado> = {}
): EstudianteListado {
  contadorEstudiante += 1;
  return {
    idUsuario: contadorEstudiante,
    nombre: `Estudiante ${contadorEstudiante}`,
    correo: `estudiante${contadorEstudiante}@devopsedu.local`,
    fechaRegistro: "2026-01-15T15:00:00.000Z",
    ruta: {
      idRuta: 1,
      fechaAsignacion: "2026-02-01T10:00:00.000Z",
      progreso: 50,
      totalModulos: 2,
      modulosCompletados: 1,
    },
    ...sobreescrituras,
  };
}

let contadorModulo = 0;

export function crearModuloReporteDePrueba(
  sobreescrituras: Partial<ModuloReporte> = {}
): ModuloReporte {
  contadorModulo += 1;
  return {
    idModulo: contadorModulo,
    nombre: `Modulo ${contadorModulo}`,
    ordenSecuencia: contadorModulo,
    estado: "completado",
    fechaInicio: "2026-03-01T10:00:00.000Z",
    actividades: {
      completadas: 1,
      total: 1,
      detalle: [
        {
          idActividad: contadorModulo,
          descripcion: "Despliega postgres con un volumen nombrado",
          fechaCompletada: "2026-03-02T10:00:00.000Z",
        },
      ],
    },
    evaluacion: {
      idEvaluacion: contadorModulo,
      titulo: `Evaluacion del modulo ${contadorModulo}`,
      mejorNota: 80,
      intentos: 2,
      intentosMaximos: 2,
      aprobada: true,
    },
    ...sobreescrituras,
  };
}

export function crearReporteEstudianteDePrueba(
  sobreescrituras: Partial<ReporteProgresoEstudiante> = {}
): ReporteProgresoEstudiante {
  contadorEstudiante += 1;
  return {
    idUsuario: contadorEstudiante,
    nombre: `Estudiante ${contadorEstudiante}`,
    correo: `estudiante${contadorEstudiante}@devopsedu.local`,
    fechaRegistro: "2026-01-15T15:00:00.000Z",
    ruta: {
      idRuta: 1,
      fechaAsignacion: "2026-02-01T10:00:00.000Z",
      progreso: 100,
      modulos: [crearModuloReporteDePrueba()],
    },
    ...sobreescrituras,
  };
}
