// Cubre: RNF-03, RNF-05 — patron unico de navegacion (barra superior +
// menu lateral con bloque activo resaltado) en todas las vistas autenticadas
// (seccion 4.2.16-4.2.18 del documento de diseño).
import { describe, it, expect, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../fixtures/usuario.factory";
import { BarraNavegacion } from "@/componentes-comunes/barra-navegacion";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

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

  it("muestra el enlace a Mi ruta solo para el rol estudiante (RF-22)", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_ESTUDIANTE }));

    renderizarConProveedores(
      <BarraNavegacion>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>
    );

    expect(screen.getByRole("link", { name: /mi ruta/i })).toHaveAttribute(
      "href",
      "/aprendizaje/mi-ruta"
    );
  });

  it("muestra los enlaces de Administracion solo para el rol docente (RF-20, RF-21)", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_DOCENTE }));

    renderizarConProveedores(
      <BarraNavegacion>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>
    );

    expect(screen.getByRole("link", { name: /modulos de aprendizaje/i })).toHaveAttribute(
      "href",
      "/administracion/modulos"
    );
    expect(screen.getByRole("link", { name: /gestion de estudiantes/i })).toHaveAttribute(
      "href",
      "/administracion/estudiantes"
    );
  });

  it("no muestra los enlaces de Administracion para el rol estudiante", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_ESTUDIANTE }));

    renderizarConProveedores(
      <BarraNavegacion>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>
    );

    expect(screen.queryByRole("link", { name: /modulos de aprendizaje/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /gestion de estudiantes/i })).not.toBeInTheDocument();
  });

  it("no muestra el enlace a Mi ruta para el rol docente", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_DOCENTE }));

    renderizarConProveedores(
      <BarraNavegacion>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>
    );

    expect(screen.queryByRole("link", { name: /mi ruta/i })).not.toBeInTheDocument();
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
