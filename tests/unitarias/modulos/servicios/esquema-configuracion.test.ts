// Cubre: RF-05, RF-06, RF-08, RNF-02 — CU-03
import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  camposConfiguracion,
  validarCrucesConfiguracion,
} from "@/modulos/servicios/esquema-configuracion";

const esquema = z.object(camposConfiguracion).superRefine(validarCrucesConfiguracion);

function configuracionValida() {
  return {
    imagenDocker: "postgres:16-alpine",
    cpuAsignado: 1,
    memoriaAsignada: 512,
    almacenamientoAsignado: 1024,
    puertos: [],
    variablesEntorno: [],
    volumenes: [],
  };
}

function mensajesDe(resultado: z.SafeParseReturnType<unknown, unknown>) {
  return resultado.success ? [] : resultado.error.issues.map((issue) => issue.message);
}

function rutasDe(resultado: z.SafeParseReturnType<unknown, unknown>) {
  return resultado.success ? [] : resultado.error.issues.map((issue) => issue.path.join("."));
}

describe("esquema de configuracion de servicio", () => {
  it("acepta una configuracion sin puertos, variables ni volumenes", () => {
    expect(esquema.safeParse(configuracionValida()).success).toBe(true);
  });

  it("acepta una configuracion con un puerto, una variable y un volumen", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      puertos: [{ host: 5432, contenedor: 5432, protocolo: "tcp" }],
      variablesEntorno: [{ clave: "POSTGRES_PASSWORD", valor: "ejemplo" }],
      volumenes: [{ origen: "/datos/pg", destino: "/var/lib/postgresql/data", modo: "rw" }],
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza un puerto fuera del rango permitido", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      puertos: [{ host: 70000, contenedor: 5432, protocolo: "tcp" }],
    });

    expect(mensajesDe(resultado).join(" ")).toMatch(/entre 1 y 65535/i);
    expect(rutasDe(resultado)).toContain("puertos.0.host");
  });

  it("rechaza un puerto que no es un numero entero", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      puertos: [{ host: 5432.5, contenedor: 5432, protocolo: "tcp" }],
    });

    expect(mensajesDe(resultado).join(" ")).toMatch(/numero entero/i);
  });

  it("rechaza dos puertos que publican el mismo puerto del host", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      puertos: [
        { host: 5432, contenedor: 5432, protocolo: "tcp" },
        { host: 5432, contenedor: 6379, protocolo: "tcp" },
      ],
    });

    expect(mensajesDe(resultado).join(" ")).toMatch(/ya esta asignado/i);
    expect(rutasDe(resultado)).toContain("puertos.1.host");
  });

  it("acepta el mismo numero en el host y en el contenedor de puertos distintos", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      puertos: [
        { host: 5432, contenedor: 5432, protocolo: "tcp" },
        { host: 6379, contenedor: 5432, protocolo: "tcp" },
      ],
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza una clave de variable con formato invalido", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      variablesEntorno: [{ clave: "clave invalida", valor: "x" }],
    });

    expect(mensajesDe(resultado).join(" ")).toMatch(/letras, numeros y guion bajo/i);
    expect(rutasDe(resultado)).toContain("variablesEntorno.0.clave");
  });

  it("rechaza una clave de variable vacia", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      variablesEntorno: [{ clave: "", valor: "x" }],
    });

    expect(resultado.success).toBe(false);
  });

  it("rechaza dos variables de entorno con la misma clave", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      variablesEntorno: [
        { clave: "POSTGRES_DB", valor: "uno" },
        { clave: "POSTGRES_DB", valor: "dos" },
      ],
    });

    expect(mensajesDe(resultado).join(" ")).toMatch(/ya esta definida/i);
    expect(rutasDe(resultado)).toContain("variablesEntorno.1.clave");
  });

  it("rechaza un volumen sin ruta en el host", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      volumenes: [{ origen: "", destino: "/datos", modo: "rw" }],
    });

    expect(rutasDe(resultado)).toContain("volumenes.0.origen");
  });

  it("rechaza una ruta de contenedor que no es absoluta", () => {
    const resultado = esquema.safeParse({
      ...configuracionValida(),
      volumenes: [{ origen: "/datos/pg", destino: "datos", modo: "rw" }],
    });

    expect(mensajesDe(resultado).join(" ")).toMatch(/empezar con \//i);
  });

  it("conserva los limites de recursos del contrato", () => {
    const resultado = esquema.safeParse({ ...configuracionValida(), cpuAsignado: 9 });

    expect(mensajesDe(resultado).join(" ")).toMatch(/8 nucleos/i);
  });
});
