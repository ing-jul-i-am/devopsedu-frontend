// Cubre: RF-20, RNF-02, RNF-05 — CU-10
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { CrearModuloPage } from "@/modulos/administracion/paginas/crear-modulo.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaModulos = `${configuracion.prefijoApi}/modulos`;

describe("CrearModuloPage", () => {
  it("muestra el titulo y el formulario de creacion", () => {
    renderizarConProveedores(<CrearModuloPage />);

    expect(screen.getByRole("heading", { name: /crear modulo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre del modulo/i)).toBeInTheDocument();
  });

  it("crea el modulo exitosamente cuando el formulario es valido", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.post(rutaModulos, () =>
        HttpResponse.json(
          { idModulo: 9, nombre: "Redes en Docker", contenido: [], orden: 1 },
          { status: 201 }
        )
      )
    );

    renderizarConProveedores(<CrearModuloPage />);

    await usuario.type(screen.getByLabelText(/nombre del modulo/i), "Redes en Docker");
    await usuario.type(screen.getByLabelText(/orden/i), "1");
    await usuario.click(screen.getByRole("button", { name: /crear modulo/i }));

    expect(await screen.findByRole("button", { name: /crear modulo/i })).toBeEnabled();
    expect(screen.queryByText(/no fue posible/i)).not.toBeInTheDocument();
  });

  it("mapea los errores de validacion del backend al campo correspondiente", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.post(rutaModulos, () =>
        HttpResponse.json(
          {
            error: "Cuerpo invalido",
            detalles: [{ campo: "nombre", mensaje: "El nombre debe tener entre 3 y 160 caracteres" }],
          },
          { status: 400 }
        )
      )
    );

    renderizarConProveedores(<CrearModuloPage />);

    await usuario.type(screen.getByLabelText(/nombre del modulo/i), "Redes en Docker");
    await usuario.type(screen.getByLabelText(/orden/i), "1");
    await usuario.click(screen.getByRole("button", { name: /crear modulo/i }));

    expect(await screen.findByText(/entre 3 y 160 caracteres/i)).toBeInTheDocument();
  });
});
