// Cubre: RNF-03, RNF-05 — barra de progreso del sistema de diseño usada en la
// barra lateral, el panel principal y la capacidad del servidor.
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BarraProgreso } from "@/componentes-comunes/barra-progreso";

describe("BarraProgreso", () => {
  it("expone el progreso con su etiqueta accesible", () => {
    render(<BarraProgreso etiqueta="Progreso de la ruta" valor={70} maximo={100} />);

    const barra = screen.getByRole("progressbar", { name: /progreso de la ruta/i });
    expect(barra).toHaveAttribute("value", "70");
    expect(barra).toHaveAttribute("max", "100");
  });

  it("limita el valor al maximo para no desbordar la barra", () => {
    render(<BarraProgreso etiqueta="Memoria" valor={3000} maximo={2048} tono="memoria" />);

    expect(screen.getByRole("progressbar", { name: /memoria/i })).toHaveAttribute(
      "value",
      "2048"
    );
  });
});
