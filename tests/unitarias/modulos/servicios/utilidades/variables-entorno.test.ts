// Cubre: RF-05, RF-06, RF-08 — CU-03
import { describe, it, expect } from "vitest";
import {
  aParesVariables,
  aRegistroVariables,
} from "@/modulos/servicios/utilidades/variables-entorno";

describe("aRegistroVariables", () => {
  it("convierte una lista de pares en el diccionario que espera el backend", () => {
    const registro = aRegistroVariables([
      { clave: "POSTGRES_PASSWORD", valor: "ejemplo" },
      { clave: "POSTGRES_DB", valor: "clase" },
    ]);

    expect(registro).toEqual({ POSTGRES_PASSWORD: "ejemplo", POSTGRES_DB: "clase" });
  });

  it("devuelve un diccionario vacio cuando no hay pares", () => {
    expect(aRegistroVariables([])).toEqual({});
  });

  it("descarta los pares cuya clave quedo vacia", () => {
    const registro = aRegistroVariables([
      { clave: "", valor: "sin-clave" },
      { clave: "  ", valor: "solo-espacios" },
      { clave: "VALIDA", valor: "si" },
    ]);

    expect(registro).toEqual({ VALIDA: "si" });
  });

  it("recorta los espacios alrededor de la clave", () => {
    expect(aRegistroVariables([{ clave: " POSTGRES_DB ", valor: "clase" }])).toEqual({
      POSTGRES_DB: "clase",
    });
  });
});

describe("aParesVariables", () => {
  it("convierte el diccionario del backend en una lista de pares", () => {
    const pares = aParesVariables({ POSTGRES_PASSWORD: "ejemplo", POSTGRES_DB: "clase" });

    expect(pares).toEqual([
      { clave: "POSTGRES_PASSWORD", valor: "ejemplo" },
      { clave: "POSTGRES_DB", valor: "clase" },
    ]);
  });

  it("devuelve una lista vacia cuando el diccionario esta vacio", () => {
    expect(aParesVariables({})).toEqual([]);
  });
});
