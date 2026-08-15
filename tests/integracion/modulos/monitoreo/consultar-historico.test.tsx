// Cubre: RF-15, RNF-03 — CU-09
import { describe, it, expect, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import App from "@/App";
import { servidorMock } from "../../../mocks/servidor";
import { renderizarConProveedores } from "../../../ayudas/renderizar-con-proveedores";
import { crearServicioDePrueba, crearServicioDetalleDePrueba } from "../../../fixtures/servicio.factory";
import { configuracion } from "@/infraestructura/configuracion";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_ESTUDIANTE } from "@/tipos/roles";

const rutaServicios = `${configuracion.prefijoApi}/servicios`;

describe("Consultar historico desde la navegacion", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("permite llegar al historico de un servicio desde el menu lateral", async () => {
    guardarSesion("token-de-prueba", {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: ID_ROL_ESTUDIANTE,
    });

    const detalle = crearServicioDetalleDePrueba({
      idServicio: 3,
      nombre: "postgres-clase-05",
      registros: [
        {
          idRegistro: 1,
          fechaHora: "2026-08-07T00:05:00.000Z",
          operacion: "desplegar",
          resultado: "exito",
          mensajeError: null,
          idServicio: 3,
          idUsuario: 1,
        },
      ],
    });
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json([crearServicioDePrueba({ idServicio: 3, nombre: "postgres-clase-05" })])
      ),
      http.get(`${rutaServicios}/3`, () => HttpResponse.json(detalle))
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/" });

    await usuario.click(screen.getByRole("link", { name: /^historico$/i }));
    await usuario.selectOptions(
      await screen.findByLabelText(/selecciona un servicio/i),
      "3"
    );

    expect(await screen.findByText("desplegar")).toBeInTheDocument();
    expect(screen.getByText(/exito/i)).toBeInTheDocument();
  });
});
