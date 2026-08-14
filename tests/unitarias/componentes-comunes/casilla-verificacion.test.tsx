// Cubre: RNF-05 — casilla de verificacion con etiqueta asociada, accesible
// por teclado (usada por "recordar sesion" en Sesion y, mas adelante, por
// otros formularios).
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CasillaVerificacion } from "@/componentes-comunes/casilla-verificacion";

describe("CasillaVerificacion", () => {
  it("asocia la etiqueta visible con la casilla", () => {
    render(<CasillaVerificacion etiqueta="Recordar sesion" name="recordar" />);

    expect(screen.getByLabelText("Recordar sesion")).toBeInTheDocument();
  });

  it("cambia de estado al hacer clic", async () => {
    const usuario = userEvent.setup();
    render(<CasillaVerificacion etiqueta="Recordar sesion" name="recordar" />);

    const casilla = screen.getByLabelText("Recordar sesion");
    expect(casilla).not.toBeChecked();

    await usuario.click(casilla);

    expect(casilla).toBeChecked();
  });
});
