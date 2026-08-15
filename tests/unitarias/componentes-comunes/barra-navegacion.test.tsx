// Cubre: RNF-03, RNF-05 — patron unico de navegacion (barra superior +
// menu lateral con bloque activo resaltado) en todas las vistas autenticadas
// (seccion 4.2.16-4.2.18 del documento de diseño).
import { describe, it, expect, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../fixtures/usuario.factory";
import { BarraNavegacion } from "@/componentes-comunes/barra-navegacion";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";

describe("BarraNavegacion", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("muestra la marca y el nombre del usuario autenticado", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ nombre: "Julian Barrera" }));

    renderizarConProveedores(
      <BarraNavegacion>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>
    );

    expect(screen.getByText("DevOpsEdu")).toBeInTheDocument();
    expect(screen.getByText("Julian Barrera")).toBeInTheDocument();
    expect(screen.getByText("Contenido de la pagina")).toBeInTheDocument();
  });

  it("muestra enlaces a las areas disponibles de la plataforma", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarConProveedores(
      <BarraNavegacion>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>
    );

    expect(screen.getByRole("link", { name: /panel principal/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /mis servicios/i })).toHaveAttribute(
      "href",
      "/servicios"
    );
    expect(screen.getByRole("link", { name: /capacidad del servidor/i })).toHaveAttribute(
      "href",
      "/capacidad-servidor"
    );
    expect(screen.getByRole("link", { name: /perfil/i })).toHaveAttribute("href", "/perfil");
    expect(screen.getByRole("link", { name: /^historico$/i })).toHaveAttribute(
      "href",
      "/monitoreo/historico"
    );
    expect(screen.getByRole("link", { name: /graficas de metricas/i })).toHaveAttribute(
      "href",
      "/monitoreo/metricas"
    );
  });

  it("resalta el enlace de la seccion activa", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarConProveedores(
      <BarraNavegacion>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>,
      { rutaInicial: "/servicios" }
    );

    expect(screen.getByRole("link", { name: /mis servicios/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: /panel principal/i })).not.toHaveAttribute(
      "aria-current"
    );
  });
});
