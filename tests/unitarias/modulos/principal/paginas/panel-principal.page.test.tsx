// Cubre: S-4.2.16, S-4.2.18 (hub principal) — RNF-03
import { describe, it, expect, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../../../fixtures/usuario.factory";
import { PanelPrincipalPage } from "@/modulos/principal/paginas/panel-principal.page";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";

describe("PanelPrincipalPage", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("saluda al usuario autenticado por su nombre", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ nombre: "Julian Barrera" }));

    renderizarConProveedores(<PanelPrincipalPage />);

    expect(screen.getByText(/julian barrera/i)).toBeInTheDocument();
  });

  it("muestra enlaces rapidos a las areas funcionales disponibles", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarConProveedores(<PanelPrincipalPage />);

    expect(screen.getByRole("link", { name: /mis servicios/i })).toHaveAttribute(
      "href",
      "/servicios"
    );
    expect(screen.getByRole("link", { name: /crear servicio/i })).toHaveAttribute(
      "href",
      "/servicios/nuevo"
    );
    expect(screen.getByRole("link", { name: /capacidad del servidor/i })).toHaveAttribute(
      "href",
      "/capacidad-servidor"
    );
  });
});
