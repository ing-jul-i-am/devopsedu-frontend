// Cubre: RF-05, RF-06, RF-08, RNF-02, RNF-05 — CU-03
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormularioConfiguracionDePrueba } from "../../../../ayudas/formulario-configuracion-de-prueba";
import { EditorVolumenes } from "@/modulos/servicios/componentes/editor-volumenes";

const VOLUMEN = {
  origen: "/datos/pg",
  destino: "/var/lib/postgresql/data",
  modo: "rw",
} as const;

describe("EditorVolumenes", () => {
  it("indica que el servicio no monta volumenes cuando la lista esta vacia", () => {
    render(
      <FormularioConfiguracionDePrueba>
        <EditorVolumenes />
      </FormularioConfiguracionDePrueba>
    );

    expect(screen.getByText(/no monta ningun volumen/i)).toBeInTheDocument();
  });

  it("agrega una fila de volumen al pulsar Agregar volumen", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba>
        <EditorVolumenes />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /agregar volumen/i }));

    const fila = screen.getByRole("group", { name: /volumen 1/i });
    expect(within(fila).getByLabelText(/ruta en el host/i)).toBeInTheDocument();
    expect(within(fila).getByLabelText(/ruta en el contenedor/i)).toBeInTheDocument();
    expect(within(fila).getByLabelText(/modo/i)).toBeInTheDocument();
  });

  it("nombra cada campo con el nombre que usa el contrato de API", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba>
        <EditorVolumenes />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /agregar volumen/i }));

    const fila = screen.getByRole("group", { name: /volumen 1/i });
    expect(within(fila).getByLabelText("Origen - ruta en el host")).toBeInTheDocument();
    expect(within(fila).getByLabelText("Destino - ruta en el contenedor")).toBeInTheDocument();
    expect(within(fila).getByLabelText("Modo - modo de acceso")).toBeInTheDocument();
  });

  it("muestra los volumenes que ya tiene el servicio", () => {
    render(
      <FormularioConfiguracionDePrueba valoresIniciales={{ volumenes: [{ ...VOLUMEN }] }}>
        <EditorVolumenes />
      </FormularioConfiguracionDePrueba>
    );

    const fila = screen.getByRole("group", { name: /volumen 1/i });
    expect(within(fila).getByLabelText(/ruta en el host/i)).toHaveValue("/datos/pg");
    expect(within(fila).getByLabelText(/modo/i)).toHaveValue("rw");
  });

  it("quita la fila al pulsar Quitar volumen", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba valoresIniciales={{ volumenes: [{ ...VOLUMEN }] }}>
        <EditorVolumenes />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /quitar volumen 1/i }));

    expect(screen.queryByRole("group", { name: /volumen 1/i })).not.toBeInTheDocument();
  });

  it("muestra un error cuando la ruta en el contenedor no es absoluta", async () => {
    const usuario = userEvent.setup();

    render(
      <FormularioConfiguracionDePrueba
        valoresIniciales={{
          volumenes: [{ origen: "/datos/pg", destino: "datos", modo: "rw" }],
        }}
      >
        <EditorVolumenes />
      </FormularioConfiguracionDePrueba>
    );

    await usuario.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText(/debe empezar con \//i)).toBeInTheDocument();
  });
});
