// Cubre: RF-18, RF-19, RNF-05 — apoya CU-08
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";
import { GraficasMetricasPage } from "@/modulos/monitoreo/paginas/graficas-metricas.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaServicios = `${configuracion.prefijoApi}/servicios`;

describe("GraficasMetricasPage", () => {
  it("muestra el selector con los servicios del usuario", async () => {
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json([crearServicioDePrueba({ idServicio: 7, nombre: "postgres-clase-04" })])
      )
    );

    renderizarConProveedores(<GraficasMetricasPage />);

    expect(await screen.findByRole("option", { name: "postgres-clase-04" })).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el servicio seleccionado aun no tiene metricas", async () => {
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json([crearServicioDePrueba({ idServicio: 7, nombre: "postgres-clase-04" })])
      ),
      http.get(`${rutaServicios}/7/metricas`, () => HttpResponse.json([]))
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<GraficasMetricasPage />);

    await usuario.selectOptions(await screen.findByLabelText(/selecciona un servicio/i), "7");

    expect(await screen.findByText(/aun no hay metricas registradas/i)).toBeInTheDocument();
  });

  it("muestra las graficas de CPU y memoria cuando hay metricas", async () => {
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json([crearServicioDePrueba({ idServicio: 7, nombre: "postgres-clase-04" })])
      ),
      http.get(`${rutaServicios}/7/metricas`, () =>
        HttpResponse.json([
          {
            idMetrica: 1,
            consumoCpu: 0.35,
            consumoMemoria: 128,
            estadoEjecucion: "en_ejecucion",
            marcaTiempo: "2026-08-07T00:10:00.000Z",
          },
        ])
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<GraficasMetricasPage />);

    await usuario.selectOptions(await screen.findByLabelText(/selecciona un servicio/i), "7");

    expect(await screen.findByRole("img", { name: /consumo de cpu/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /consumo de memoria/i })).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando falla la carga de metricas", async () => {
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json([crearServicioDePrueba({ idServicio: 7, nombre: "postgres-clase-04" })])
      ),
      http.get(`${rutaServicios}/7/metricas`, () =>
        HttpResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<GraficasMetricasPage />);

    await usuario.selectOptions(await screen.findByLabelText(/selecciona un servicio/i), "7");

    expect(await screen.findByText(/no fue posible cargar las metricas/i)).toBeInTheDocument();
  });
});
