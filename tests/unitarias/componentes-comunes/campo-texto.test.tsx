// Cubre: RNF-02, RNF-05 — campo de formulario con etiqueta asociada,
// texto de ayuda y mensaje de error accesibles (usado por los formularios
// de Sesion y, mas adelante, por el resto de modulos).
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CampoTexto } from "@/componentes-comunes/campo-texto";

describe("CampoTexto", () => {
  it("asocia la etiqueta visible con el campo de entrada", () => {
    render(<CampoTexto etiqueta="Correo" name="correo" />);

    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
  });

  it("permite escribir en el campo", async () => {
    const usuario = userEvent.setup();
    render(<CampoTexto etiqueta="Correo" name="correo" />);

    await usuario.type(screen.getByLabelText("Correo"), "hola@devopsedu.local");

    expect(screen.getByLabelText("Correo")).toHaveValue("hola@devopsedu.local");
  });

  it("muestra el texto de ayuda cuando se proporciona", () => {
    render(
      <CampoTexto
        etiqueta="Correo"
        name="correo"
        textoAyuda="Usa tu correo institucional"
      />
    );

    expect(screen.getByText("Usa tu correo institucional")).toBeInTheDocument();
  });

  it("muestra el mensaje de error y lo asocia al campo cuando se proporciona", () => {
    render(<CampoTexto etiqueta="Correo" name="correo" error="Correo invalido" />);

    const campo = screen.getByLabelText("Correo");
    expect(screen.getByText("Correo invalido")).toBeInTheDocument();
    expect(campo).toHaveAttribute("aria-invalid", "true");
  });
});
