// Cubre: RF-25 — CU-15
import { describe, it, expect } from "vitest";
import { resumirGrupo } from "@/modulos/administracion/utilidades/resumen-grupo";
import { crearEstudianteListadoDePrueba } from "../../../../fixtures/reporte.factory";

function conProgreso(progreso: number) {
  return crearEstudianteListadoDePrueba({
    ruta: {
      idRuta: 1,
      fechaAsignacion: "2026-02-01T10:00:00.000Z",
      progreso,
      totalModulos: 2,
      modulosCompletados: 1,
    },
  });
}

describe("resumirGrupo", () => {
  it("cuenta los estudiantes y los que tienen ruta, y promedia solo el progreso de estos", () => {
    const resumen = resumirGrupo([
      conProgreso(100),
      conProgreso(50),
      crearEstudianteListadoDePrueba({ ruta: null }),
    ]);

    expect(resumen).toEqual({ total: 3, conRuta: 2, progresoPromedio: 75 });
  });

  it("no calcula un promedio cuando ningun estudiante tiene ruta", () => {
    const resumen = resumirGrupo([crearEstudianteListadoDePrueba({ ruta: null })]);

    expect(resumen).toEqual({ total: 1, conRuta: 0, progresoPromedio: null });
  });

  it("devuelve ceros para un grupo vacio", () => {
    expect(resumirGrupo([])).toEqual({ total: 0, conRuta: 0, progresoPromedio: null });
  });
});
