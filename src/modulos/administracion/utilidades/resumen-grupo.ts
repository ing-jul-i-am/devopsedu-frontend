// Resumen del grupo para la vista de reportes a partir del listado de
// estudiantes (contrato 7.2): cuantos son, cuantos tienen ruta y el progreso
// promedio de quienes la tienen. El progreso de cada estudiante ya viene
// calculado por el backend; aqui solo se agrega para presentarlo (DT-18).
// Cubre: RF-25 — CU-15
import type { EstudianteListado } from "@/tipos/reportes";

export interface ResumenGrupo {
  total: number;
  conRuta: number;
  progresoPromedio: number | null;
}

export function resumirGrupo(estudiantes: EstudianteListado[]): ResumenGrupo {
  const progresos = estudiantes.flatMap((estudiante) =>
    estudiante.ruta ? [estudiante.ruta.progreso] : []
  );
  const suma = progresos.reduce((total, progreso) => total + progreso, 0);

  return {
    total: estudiantes.length,
    conRuta: progresos.length,
    progresoPromedio: progresos.length > 0 ? suma / progresos.length : null,
  };
}
