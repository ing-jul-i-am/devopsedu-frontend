// Cubre: S-4.2.16, S-4.2.18 (panel principal) — RF-10, RF-16, RF-22, RNF-03 —
// CU-08, CU-13 (DT-17)
import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../../../fixtures/usuario.factory";
import { PanelPrincipalPage } from "@/modulos/principal/paginas/panel-principal.page";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { configuracion } from "@/infraestructura/configuracion";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

const rutaMiRuta = `${configuracion.prefijoApi}/aprendizaje/mi-ruta`;

describe("PanelPrincipalPage", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("saluda al usuario autenticado por su nombre", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ nombre: "Julian Barrera" }));

    renderizarConProveedores(<PanelPrincipalPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /bienvenido, julian barrera/i })
    ).toBeInTheDocument();
  });

  it("muestra al estudiante sus servicios, su ruta y la capacidad del servidor", async () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_ESTUDIANTE }));

    renderizarConProveedores(<PanelPrincipalPage />);

    expect(screen.getByRole("heading", { name: /^mis servicios$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /mi ruta de aprendizaje/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /capacidad del servidor/i })).toBeInTheDocument();
    expect(await screen.findByText(/aún no tienes una ruta de aprendizaje/i)).toBeInTheDocument();
  });

  it("ofrece accesos al historico y a las graficas de metricas", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarConProveedores(<PanelPrincipalPage />);

    expect(screen.getByRole("link", { name: /histórico/i })).toHaveAttribute(
      "href",
      "/monitoreo/historico"
    );
    expect(screen.getByRole("link", { name: /gráficas de métricas/i })).toHaveAttribute(
      "href",
      "/monitoreo/metricas"
    );
  });

  it("no muestra ni consulta la ruta de aprendizaje al docente", async () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_DOCENTE }));
    const consultaRuta = vi.fn();
    servidorMock.use(
      http.get(rutaMiRuta, () => {
        consultaRuta();
        return HttpResponse.json(null, { status: 403 });
      })
    );

    renderizarConProveedores(<PanelPrincipalPage />);

    expect(await screen.findByRole("heading", { name: /capacidad del servidor/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /mi ruta de aprendizaje/i })).not.toBeInTheDocument();
    expect(consultaRuta).not.toHaveBeenCalled();
  });
});
