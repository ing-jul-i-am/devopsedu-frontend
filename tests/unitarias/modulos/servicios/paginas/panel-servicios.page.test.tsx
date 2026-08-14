// Cubre: RF-16, RNF-05 — CU-08
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";
import { PanelServiciosPage } from "@/modulos/servicios/paginas/panel-servicios.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaServicios = `${configuracion.prefijoApi}/servicios`;

describe("PanelServiciosPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaServicios, async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json([]);
      })
    );

    renderizarConProveedores(<PanelServiciosPage />);

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra los servicios del usuario cuando la carga es exitosa", async () => {
    const servicios = [
      crearServicioDePrueba({ idServicio: 1, nombre: "postgres-clase-04" }),
      crearServicioDePrueba({ idServicio: 2, nombre: "redis-cache" }),
    ];
    servidorMock.use(http.get(rutaServicios, () => HttpResponse.json(servicios)));

    renderizarConProveedores(<PanelServiciosPage />);

    expect(await screen.findByText("postgres-clase-04")).toBeInTheDocument();
    expect(screen.getByText("redis-cache")).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el usuario no tiene servicios", async () => {
    servidorMock.use(http.get(rutaServicios, () => HttpResponse.json([])));

    renderizarConProveedores(<PanelServiciosPage />);

    expect(await screen.findByText(/aun no tienes servicios/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando falla la carga", async () => {
    servidorMock.use(
      http.get(rutaServicios, () =>
        HttpResponse.json({ error: "Token invalido o expirado" }, { status: 401 })
      )
    );

    renderizarConProveedores(<PanelServiciosPage />);

    expect(await screen.findByText(/no fue posible cargar/i)).toBeInTheDocument();
  });

  it("muestra un enlace para crear un nuevo servicio", async () => {
    servidorMock.use(http.get(rutaServicios, () => HttpResponse.json([])));

    renderizarConProveedores(<PanelServiciosPage />);

    expect(screen.getByRole("link", { name: /crear servicio/i })).toHaveAttribute(
      "href",
      "/servicios/nuevo"
    );
  });
});
