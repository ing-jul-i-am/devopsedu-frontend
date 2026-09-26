// Cubre: RF-05, RF-06, RF-08, RNF-02, RNF-05 — CU-03
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormularioConfiguracionDePrueba } from "../../../../ayudas/formulario-configuracion-de-prueba";
import { EditorPuertos } from "@/modulos/servicios/componentes/editor-puertos";

describe("EditorPuertos", () => {
  it("indica que el servicio no publica puertos cuando la lista esta vacia", () => {
    render(
      <FormularioConfiguracionDePrueba>
        <EditorPuertos />
      </FormularioConfiguracionDePrueba>
    );

    expect(screen.getByText(/no publica ningun puerto/i)).toBeInTheDocument();
  });

  it("agrega una fila de puerto al pulsar Agregar puerto", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba>
        <EditorPuertos />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /agregar puerto/i }));

    const fila = screen.getByRole("group", { name: /puerto 1/i });
    expect(within(fila).getByLabelText(/puerto del host/i)).toBeInTheDocument();
    expect(within(fila).getByLabelText(/puerto del contenedor/i)).toBeInTheDocument();
    expect(within(fila).getByLabelText(/protocolo/i)).toBeInTheDocument();
  });

  it("muestra los puertos que ya tiene el servicio", () => {
    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{ puertos: [{ host: 5432, contenedor: 5432, protocolo: "tcp" }] }}
      >
        <EditorPuertos />
      </FormularioConfiguracionDePrueba>
    );

    const fila = screen.getByRole("group", { name: /puerto 1/i });
    expect(within(fila).getByLabelText(/puerto del host/i)).toHaveValue(5432);
  });

  it("quita la fila al pulsar Quitar puerto", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{ puertos: [{ host: 5432, contenedor: 5432, protocolo: "tcp" }] }}
      >
        <EditorPuertos />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /quitar puerto 1/i }));

    expect(screen.queryByRole("group", { name: /puerto 1/i })).not.toBeInTheDocument();
    expect(screen.getByText(/no publica ningun puerto/i)).toBeInTheDocument();
  });

  it("muestra un error cuando el puerto del host esta fuera de rango", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{ puertos: [{ host: 70000, contenedor: 5432, protocolo: "tcp" }] }}
      >
        <EditorPuertos />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText(/entre 1 y 65535/i)).toBeInTheDocument();
  });

  it("muestra un error cuando dos puertos usan el mismo puerto del host", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{
          puertos: [
            { host: 5432, contenedor: 5432, protocolo: "tcp" },
            { host: 5432, contenedor: 6379, protocolo: "tcp" },
          ],
        }}
      >
        <EditorPuertos />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText(/ya esta asignado/i)).toBeInTheDocument();
  });
});
