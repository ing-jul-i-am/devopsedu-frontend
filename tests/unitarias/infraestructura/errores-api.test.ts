/**
 * Cubre: RNF-02 — normalizacion de las 3 formas de error documentadas en
 * docs/contrato-api.md (generica, validacion con detalles, RecursosInsuficientesError)
 * para que los formularios muestren mensajes claros y orientativos.
 */
import { describe, expect, it } from "vitest";
import { normalizarErrorApi } from "@/infraestructura/errores-api";

function crearErrorAxios(status: number, data: unknown): unknown {
  return {
    isAxiosError: true,
    response: { status, data },
  };
}

describe("normalizarErrorApi", () => {
  it("extrae el mensaje de un error generico de la API", () => {
    const error = crearErrorAxios(404, { error: "Servicio no encontrado" });

    const resultado = normalizarErrorApi(error);

    expect(resultado.mensaje).toBe("Servicio no encontrado");
    expect(resultado.detalles).toBeUndefined();
  });

  it("extrae los detalles por campo de un error de validacion", () => {
    const error = crearErrorAxios(400, {
      error: "Datos de entrada invalidos",
      detalles: [{ campo: "correo", mensaje: "Debe ser un correo valido" }],
    });

    const resultado = normalizarErrorApi(error);

    expect(resultado.mensaje).toBe("Datos de entrada invalidos");
    expect(resultado.detalles).toEqual([
      { campo: "correo", mensaje: "Debe ser un correo valido" },
    ]);
  });

  it("extrae solicitado y disponible de RecursosInsuficientesError", () => {
    const error = crearErrorAxios(422, {
      error: "Recursos insuficientes para la configuracion solicitada",
      solicitado: { cpu: 4, memoria: 8192, almacenamiento: 20480 },
      disponible: { cpu: 2, memoria: 4096, almacenamiento: 10240 },
    });

    const resultado = normalizarErrorApi(error);

    expect(resultado.solicitado).toEqual({ cpu: 4, memoria: 8192, almacenamiento: 20480 });
    expect(resultado.disponible).toEqual({ cpu: 2, memoria: 4096, almacenamiento: 10240 });
  });

  it("usa un mensaje generico cuando la respuesta no tiene el formato esperado", () => {
    const error = crearErrorAxios(500, "texto plano inesperado");

    const resultado = normalizarErrorApi(error);

    expect(resultado.mensaje).toBe("Ocurrio un error inesperado");
  });

  it("usa un mensaje de conectividad cuando no hay respuesta del servidor", () => {
    const errorSinRespuesta = { isAxiosError: true, response: undefined };

    const resultado = normalizarErrorApi(errorSinRespuesta);

    expect(resultado.mensaje).toBe("No fue posible comunicarse con el servidor");
  });

  it("usa un mensaje de conectividad cuando el error no proviene de axios", () => {
    const resultado = normalizarErrorApi(new Error("fallo desconocido"));

    expect(resultado.mensaje).toBe("No fue posible comunicarse con el servidor");
  });
});
