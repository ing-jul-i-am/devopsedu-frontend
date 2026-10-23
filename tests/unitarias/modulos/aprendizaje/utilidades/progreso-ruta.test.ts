// Cubre: RF-22 — CU-13. Lectura del avance de la ruta para la barra lateral y
// el panel principal (DT-17).
import { describe, it, expect } from "vitest";
import { crearMiRutaDePrueba } from "../../../../fixtures/aprendizaje.factory";
import {
  buscarModuloParaContinuar,
  contarModulosCompletados,
} from "@/modulos/aprendizaje/utilidades/progreso-ruta";

const ruta = crearMiRutaDePrueba({
  modulos: [
    { idModulo: 9, nombre: "Volumenes", ordenSecuencia: 3, estado: "sin_iniciar" },
    { idModulo: 4, nombre: "Introduccion", ordenSecuencia: 1, estado: "completado" },
    { idModulo: 6, nombre: "Redes", ordenSecuencia: 2, estado: "en_progreso" },
  ],
});

describe("contarModulosCompletados", () => {
  it("cuenta los modulos con estado completado", () => {
    expect(contarModulosCompletados(ruta)).toBe(1);
  });
});

describe("buscarModuloParaContinuar", () => {
  it("devuelve el primer modulo no completado en el orden de la secuencia, con su posicion", () => {
    expect(buscarModuloParaContinuar(ruta)).toEqual({
      modulo: { idModulo: 6, nombre: "Redes", ordenSecuencia: 2, estado: "en_progreso" },
      posicion: 2,
    });
  });

  it("devuelve null cuando todos los modulos estan completados", () => {
    const terminada = crearMiRutaDePrueba({
      modulos: [{ idModulo: 1, nombre: "Unico", ordenSecuencia: 1, estado: "completado" }],
    });

    expect(buscarModuloParaContinuar(terminada)).toBeNull();
  });
});
