// Cubre: RF-20, RNF-02, RNF-05 — CU-10
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { FormularioModulo } from "@/modulos/administracion/componentes/formulario-modulo";

function crearErrorAxios(status: number, datos: unknown) {
  const error = new AxiosError("fallo", String(status), undefined, undefined, {
    status,
    data: datos,
    statusText: "",
    headers: {},
    config: {} as never,
  });
  return error;
}

describe("FormularioModulo", () => {
  it("muestra los campos vacios cuando no hay valores iniciales", () => {
    renderizarConProveedores(
      <FormularioModulo alEnviar={async () => {}} cargando={false} textoBoton="Crear modulo" />
    );

    expect(screen.getByLabelText(/nombre del modulo/i)).toHaveValue("");
    expect(screen.getByLabelText(/orden/i)).toHaveValue(null);
    expect(screen.getByText(/aun no agregas contenido/i)).toBeInTheDocument();
  });

  it("precarga los valores iniciales cuando se edita un modulo existente", () => {
    renderizarConProveedores(
      <FormularioModulo
        valoresIniciales={{
          nombre: "Redes en Docker",
          orden: 2,
          contenido: [{ tipo: "enlace", url: "https://docs.docker.com/", titulo: "Docker" }],
        }}
        alEnviar={async () => {}}
        cargando={false}
        textoBoton="Guardar cambios"
      />
    );

    expect(screen.getByLabelText(/nombre del modulo/i)).toHaveValue("Redes en Docker");
    expect(screen.getByLabelText(/orden/i)).toHaveValue(2);
    expect(screen.getByDisplayValue("https://docs.docker.com/")).toBeInTheDocument();
  });

  it("muestra un error de validacion cuando el nombre es muy corto", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(
      <FormularioModulo alEnviar={async () => {}} cargando={false} textoBoton="Crear modulo" />
    );

    await usuario.type(screen.getByLabelText(/nombre del modulo/i), "AB");
    await usuario.tab();

    expect(await screen.findByText(/al menos 3 caracteres/i)).toBeInTheDocument();
  });

  it("envia nombre, orden y contenido cuando los datos son validos", async () => {
    const usuario = userEvent.setup();
    const alEnviar = vi.fn().mockResolvedValue(undefined);
    renderizarConProveedores(
      <FormularioModulo alEnviar={alEnviar} cargando={false} textoBoton="Crear modulo" />
    );

    await usuario.type(screen.getByLabelText(/nombre del modulo/i), "Redes en Docker");
    await usuario.type(screen.getByLabelText(/orden/i), "1");
    await usuario.click(screen.getByRole("button", { name: /crear modulo/i }));

    expect(alEnviar).toHaveBeenCalledWith({
      nombre: "Redes en Docker",
      orden: 1,
      contenido: [],
    });
  });

  it("mapea un error 400 del backend al campo correspondiente", async () => {
    const usuario = userEvent.setup();
    const alEnviar = vi.fn().mockImplementation(() => {
      throw crearErrorAxios(400, {
        error: "Cuerpo invalido",
        detalles: [{ campo: "nombre", mensaje: "El nombre debe tener entre 3 y 160 caracteres" }],
      });
    });
    renderizarConProveedores(
      <FormularioModulo alEnviar={alEnviar} cargando={false} textoBoton="Crear modulo" />
    );

    await usuario.type(screen.getByLabelText(/nombre del modulo/i), "Redes en Docker");
    await usuario.type(screen.getByLabelText(/orden/i), "1");
    await usuario.click(screen.getByRole("button", { name: /crear modulo/i }));

    expect(await screen.findByText(/entre 3 y 160 caracteres/i)).toBeInTheDocument();
  });
});
