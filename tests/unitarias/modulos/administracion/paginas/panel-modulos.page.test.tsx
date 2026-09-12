// Cubre: RF-20, RNF-05 — CU-10
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearModuloDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { PanelModulosPage } from "@/modulos/administracion/paginas/panel-modulos.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaModulos = `${configuracion.prefijoApi}/modulos`;

describe("PanelModulosPage", () => {
  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get(rutaModulos, async () => {
        await new Promise((resolver) => setTimeout(resolver, 100));
        return HttpResponse.json([]);
      })
    );

    renderizarConProveedores(<PanelModulosPage />);

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra los modulos existentes ordenados", async () => {
    const modulos = [
      crearModuloDePrueba({ idModulo: 1, nombre: "Redes en Docker", orden: 2 }),
      crearModuloDePrueba({ idModulo: 2, nombre: "Introduccion a contenedores", orden: 1 }),
    ];
    servidorMock.use(http.get(rutaModulos, () => HttpResponse.json(modulos)));

    renderizarConProveedores(<PanelModulosPage />);

    expect(await screen.findByText("Redes en Docker")).toBeInTheDocument();
    expect(screen.getByText("Introduccion a contenedores")).toBeInTheDocument();
  });

  it("muestra un mensaje cuando no hay modulos creados", async () => {
    servidorMock.use(http.get(rutaModulos, () => HttpResponse.json([])));

    renderizarConProveedores(<PanelModulosPage />);

    expect(await screen.findByText(/aun no hay modulos creados/i)).toBeInTheDocument();
  });

  it("muestra un enlace para crear un nuevo modulo", async () => {
    servidorMock.use(http.get(rutaModulos, () => HttpResponse.json([])));

    renderizarConProveedores(<PanelModulosPage />);

    expect(screen.getByRole("link", { name: /crear modulo/i })).toHaveAttribute(
      "href",
      "/administracion/modulos/nuevo"
    );
  });

  it("cada modulo enlaza a su vista de edicion", async () => {
    servidorMock.use(
      http.get(rutaModulos, () => HttpResponse.json([crearModuloDePrueba({ idModulo: 5 })]))
    );

    renderizarConProveedores(<PanelModulosPage />);

    expect(await screen.findByRole("link", { name: /modulo de prueba/i })).toHaveAttribute(
      "href",
      "/administracion/modulos/5"
    );
  });
});
