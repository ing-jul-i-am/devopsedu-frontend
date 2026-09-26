// Cubre: RF-05, RF-06, RF-08, RNF-02, RNF-05 — CU-03
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormularioConfiguracionDePrueba } from "../../../../ayudas/formulario-configuracion-de-prueba";
import { EditorVariablesEntorno } from "@/modulos/servicios/componentes/editor-variables-entorno";

describe("EditorVariablesEntorno", () => {
  it("indica que el servicio no tiene variables cuando la lista esta vacia", () => {
    render(
      <FormularioConfiguracionDePrueba>
        <EditorVariablesEntorno />
      </FormularioConfiguracionDePrueba>
    );

    expect(screen.getByText(/no define ninguna variable/i)).toBeInTheDocument();
  });

  it("agrega una fila de variable al pulsar Agregar variable", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba>
        <EditorVariablesEntorno />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /agregar variable/i }));

    const fila = screen.getByRole("group", { name: /variable 1/i });
    expect(within(fila).getByLabelText(/clave/i)).toBeInTheDocument();
    expect(within(fila).getByLabelText(/valor/i)).toBeInTheDocument();
  });

  it("muestra las variables que ya tiene el servicio", () => {
    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{
          variablesEntorno: [{ clave: "POSTGRES_PASSWORD", valor: "ejemplo" }],
        }}
      >
        <EditorVariablesEntorno />
      </FormularioConfiguracionDePrueba>
    );

    const fila = screen.getByRole("group", { name: /variable 1/i });
    expect(within(fila).getByLabelText(/clave/i)).toHaveValue("POSTGRES_PASSWORD");
    expect(within(fila).getByLabelText(/valor/i)).toHaveValue("ejemplo");
  });

  it("quita la fila al pulsar Quitar variable", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{ variablesEntorno: [{ clave: "POSTGRES_DB", valor: "clase" }] }}
      >
        <EditorVariablesEntorno />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /quitar variable 1/i }));

    expect(screen.queryByRole("group", { name: /variable 1/i })).not.toBeInTheDocument();
  });

  it("muestra un error cuando la clave tiene un formato invalido", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{ variablesEntorno: [{ clave: "clave invalida", valor: "x" }] }}
      >
        <EditorVariablesEntorno />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText(/no puede empezar con un numero/i)).toBeInTheDocument();
  });

  it("muestra un error cuando dos variables repiten la misma clave", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{
          variablesEntorno: [
            { clave: "POSTGRES_DB", valor: "uno" },
            { clave: "POSTGRES_DB", valor: "dos" },
          ],
        }}
      >
        <EditorVariablesEntorno />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText(/ya esta definida/i)).toBeInTheDocument();
  });
});
