// Cubre: RF-22, RNF-03, RNF-05 — CU-13
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsigniaEstadoModulo } from "@/modulos/aprendizaje/componentes/insignia-estado-modulo";

describe("InsigniaEstadoModulo", () => {
  it("muestra 'Completado' para un modulo completado", () => {
    render(<InsigniaEstadoModulo estado="completado" />);
    expect(screen.getByText("Completado")).toBeInTheDocument();
  });

  it("muestra 'En progreso' para un modulo en progreso", () => {
    render(<InsigniaEstadoModulo estado="en_progreso" />);
    expect(screen.getByText("En progreso")).toBeInTheDocument();
  });

  it("muestra 'Sin iniciar' para un modulo sin iniciar", () => {
    render(<InsigniaEstadoModulo estado="sin_iniciar" />);
    expect(screen.getByText("Sin iniciar")).toBeInTheDocument();
  });
});
