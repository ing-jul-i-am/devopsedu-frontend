// Cubre: RF-25 — CU-16 (descarga del reporte exportado, DT-19)
import { afterEach, describe, expect, it } from "vitest";
import { extraerNombreArchivo, guardarArchivo } from "@/utilidades/descarga-archivo";
import { simularDescarga } from "../../ayudas/simular-descarga";

describe("extraerNombreArchivo", () => {
  it("lee el nombre entre comillas de Content-Disposition", () => {
    expect(
      extraerNombreArchivo(
        'attachment; filename="reporte-progreso-2026-10-23.csv"',
        "reporte.csv"
      )
    ).toBe("reporte-progreso-2026-10-23.csv");
  });

  it("lee el nombre sin comillas", () => {
    expect(extraerNombreArchivo("attachment; filename=reporte.pdf", "otro.pdf")).toBe(
      "reporte.pdf"
    );
  });

  it("prefiere filename* codificado en UTF-8 cuando esta presente", () => {
    expect(
      extraerNombreArchivo(
        "attachment; filename=\"reporte.csv\"; filename*=UTF-8''reporte-a%C3%B1o.csv",
        "otro.csv"
      )
    ).toBe("reporte-año.csv");
  });

  it("usa el nombre por defecto cuando falta la cabecera o no trae nombre", () => {
    expect(extraerNombreArchivo(undefined, "reporte.csv")).toBe("reporte.csv");
    expect(extraerNombreArchivo("attachment", "reporte.csv")).toBe("reporte.csv");
  });
});

describe("guardarArchivo", () => {
  let simulacion: ReturnType<typeof simularDescarga>;

  afterEach(() => {
    simulacion.restaurar();
  });

  it("descarga el contenido con el nombre indicado y libera la URL temporal", () => {
    simulacion = simularDescarga();
    const contenido = new Blob(["id_estudiante\r\n"], { type: "text/csv" });

    guardarArchivo(contenido, "reporte.csv");

    expect(simulacion.descargas).toEqual([{ nombre: "reporte.csv", contenido }]);
    expect(simulacion.liberarUrl).toHaveBeenCalledWith("blob:descarga-1");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
