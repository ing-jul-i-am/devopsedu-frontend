// Cubre: RNF-02, RNF-05 — selector de formulario con etiqueta asociada,
// usado por las vistas de Monitoreo para elegir un servicio.
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CampoSelector } from "@/componentes-comunes/campo-selector";

const OPCIONES = [
  { valor: "1", etiqueta: "postgres-clase-04" },
  { valor: "2", etiqueta: "redis-cache" },
];

describe("CampoSelector", () => {
  it("asocia la etiqueta visible con el selector", () => {
    render(<CampoSelector etiqueta="Servicio" opciones={OPCIONES} onChange={() => {}} />);

    expect(screen.getByLabelText("Servicio")).toBeInTheDocument();
  });

  it("muestra las opciones recibidas", () => {
    render(<CampoSelector etiqueta="Servicio" opciones={OPCIONES} onChange={() => {}} />);

    expect(screen.getByRole("option", { name: "postgres-clase-04" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "redis-cache" })).toBeInTheDocument();
  });

  it("muestra el placeholder como primera opcion cuando se proporciona", () => {
    render(
      <CampoSelector
        etiqueta="Servicio"
        opciones={OPCIONES}
        placeholder="Elige un servicio"
        onChange={() => {}}
      />
    );

    expect(screen.getByRole("option", { name: "Elige un servicio" })).toBeInTheDocument();
  });

  it("permite seleccionar una opcion", async () => {
    const usuario = userEvent.setup();
    render(<CampoSelector etiqueta="Servicio" opciones={OPCIONES} onChange={() => {}} />);

    await usuario.selectOptions(screen.getByLabelText("Servicio"), "2");

    expect(screen.getByLabelText("Servicio")).toHaveValue("2");
  });
});
