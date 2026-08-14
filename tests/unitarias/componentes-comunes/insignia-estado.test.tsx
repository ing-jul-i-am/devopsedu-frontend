// Cubre: RF-17, RNF-05 — representacion visual de los 7 estados del
// diagrama de estados del Servicio (seccion 4.2.14 del diseño).
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsigniaEstado } from "@/componentes-comunes/insignia-estado";

describe("InsigniaEstado", () => {
  it("muestra la etiqueta en español del estado en_ejecucion", () => {
    render(<InsigniaEstado estado="en_ejecucion" />);

    expect(screen.getByText(/en ejecucion/i)).toBeInTheDocument();
  });

  it("muestra la etiqueta en español del estado fallido", () => {
    render(<InsigniaEstado estado="fallido" />);

    expect(screen.getByText(/fallido/i)).toBeInTheDocument();
  });

  it("muestra la etiqueta en español del estado configurado", () => {
    render(<InsigniaEstado estado="configurado" />);

    expect(screen.getByText(/configurado/i)).toBeInTheDocument();
  });
});
