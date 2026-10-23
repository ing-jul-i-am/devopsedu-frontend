// Cubre: RF-10, RNF-02 — presentacion legible de los recursos del servidor
// (nucleos de CPU y megabytes) en el panel principal.
import { describe, it, expect } from "vitest";
import {
  formatearMegabytes,
  formatearNucleos,
  formatearUsoMegabytes,
} from "@/utilidades/formatear-capacidad";

describe("formatearNucleos", () => {
  it("muestra hasta dos decimales sin ceros sobrantes", () => {
    expect(formatearNucleos(1.75)).toBe("1.75");
    expect(formatearNucleos(0.5)).toBe("0.5");
    expect(formatearNucleos(4)).toBe("4");
    expect(formatearNucleos(2.333)).toBe("2.33");
  });
});

describe("formatearMegabytes", () => {
  it("usa MB por debajo de un gigabyte", () => {
    expect(formatearMegabytes(896)).toBe("896 MB");
  });

  it("usa GB a partir de 1024 MB, con un decimal como maximo", () => {
    expect(formatearMegabytes(2048)).toBe("2 GB");
    expect(formatearMegabytes(1228.8)).toBe("1.2 GB");
    expect(formatearMegabytes(10240)).toBe("10 GB");
  });
});

describe("formatearUsoMegabytes", () => {
  it("escribe la unidad una sola vez cuando ambos valores la comparten", () => {
    expect(formatearUsoMegabytes(1228.8, 10240)).toBe("1.2 / 10 GB");
  });

  it("escribe cada unidad cuando difieren", () => {
    expect(formatearUsoMegabytes(896, 2048)).toBe("896 MB / 2 GB");
  });
});
