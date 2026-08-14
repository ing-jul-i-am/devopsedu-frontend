// Cubre: RF-10, RNF-05 — CU-04
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MedidorCapacidad } from "@/componentes-comunes/medidor-capacidad";

describe("MedidorCapacidad", () => {
  it("muestra la etiqueta y los valores disponibles y totales", () => {
    render(<MedidorCapacidad etiqueta="CPU" total={8} disponible={5.5} unidad="nucleos" />);

    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText(/5.5 \/ 8 nucleos disponibles/i)).toBeInTheDocument();
  });

  it("expone el progreso de uso de forma accesible", () => {
    render(<MedidorCapacidad etiqueta="Memoria" total={16384} disponible={12288} unidad="MB" />);

    expect(screen.getByRole("progressbar", { name: /memoria/i })).toBeInTheDocument();
  });
});
