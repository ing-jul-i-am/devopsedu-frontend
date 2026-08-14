// Cubre: RNF-03, RNF-05 — boton del sistema de diseño con estado de carga
// accesible (usado por los formularios de Sesion y, mas adelante, por el
// resto de modulos).
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Boton } from "@/componentes-comunes/boton";

describe("Boton", () => {
  it("muestra el texto recibido", () => {
    render(<Boton>Entrar</Boton>);

    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("se deshabilita y comunica el estado de carga cuando cargando es verdadero", () => {
    render(<Boton cargando>Entrar</Boton>);

    const boton = screen.getByRole("button");
    expect(boton).toBeDisabled();
    expect(boton).toHaveTextContent(/procesando/i);
  });
});
