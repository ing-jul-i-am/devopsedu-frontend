// Cubre: RF-15, RNF-05 — CU-09
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import {
  crearServicioDePrueba,
  crearServicioDetalleDePrueba,
} from "../../../../fixtures/servicio.factory";
import { HistoricoOperacionesPage } from "@/modulos/monitoreo/paginas/historico-operaciones.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaServicios = `${configuracion.prefijoApi}/servicios`;

describe("HistoricoOperacionesPage", () => {
  it("muestra un mensaje cuando el usuario no tiene servicios", async () => {
    servidorMock.use(http.get(rutaServicios, () => HttpResponse.json([])));

    renderizarConProveedores(<HistoricoOperacionesPage />);

    expect(await screen.findByText(/aun no tienes servicios/i)).toBeInTheDocument();
  });

  it("muestra el selector con los servicios del usuario", async () => {
    const servicios = [
      crearServicioDePrueba({ idServicio: 1, nombre: "postgres-clase-04" }),
      crearServicioDePrueba({ idServicio: 2, nombre: "redis-cache" }),
    ];
    servidorMock.use(http.get(rutaServicios, () => HttpResponse.json(servicios)));

    renderizarConProveedores(<HistoricoOperacionesPage />);

    expect(await screen.findByRole("option", { name: "postgres-clase-04" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "redis-cache" })).toBeInTheDocument();
  });

  it("muestra el historial del servicio seleccionado", async () => {
    const servicios = [crearServicioDePrueba({ idServicio: 7, nombre: "postgres-clase-04" })];
    const detalle = crearServicioDetalleDePrueba({
      idServicio: 7,
      nombre: "postgres-clase-04",
      registros: [
        {
          idRegistro: 1,
          fechaHora: "2026-08-07T00:05:00.000Z",
          operacion: "desplegar",
          resultado: "exito",
          mensajeError: null,
          idServicio: 7,
          idUsuario: 1,
        },
      ],
    });
    servidorMock.use(
      http.get(rutaServicios, () => HttpResponse.json(servicios)),
      http.get(`${rutaServicios}/7`, () => HttpResponse.json(detalle))
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<HistoricoOperacionesPage />);

    await usuario.selectOptions(
      await screen.findByLabelText(/selecciona un servicio/i),
      "7"
    );

    const item = await screen.findByRole("listitem");
    expect(item).toHaveTextContent(/desplegar/i);
  });

  it("muestra un mensaje de error cuando falla la carga del historial", async () => {
    const servicios = [crearServicioDePrueba({ idServicio: 7, nombre: "postgres-clase-04" })];
    servidorMock.use(
      http.get(rutaServicios, () => HttpResponse.json(servicios)),
      http.get(`${rutaServicios}/7`, () =>
        HttpResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<HistoricoOperacionesPage />);

    await usuario.selectOptions(
      await screen.findByLabelText(/selecciona un servicio/i),
      "7"
    );

    expect(await screen.findByText(/no fue posible cargar el historial/i)).toBeInTheDocument();
  });
});
