// Cubre: RNF-03, RNF-05 — patron unico de navegacion (barra superior +
// menu lateral con iconos, agrupado por categorias y con la seccion activa
// resaltada) en todas las vistas autenticadas (seccion 4.2.16-4.2.18 del
// documento de diseño, DT-17).
import { describe, it, expect, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../fixtures/usuario.factory";
import { BarraNavegacion } from "@/componentes-comunes/barra-navegacion";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

function renderizarBarra(opciones: { rutaInicial?: string } = {}) {
  return renderizarConProveedores(
    <BarraNavegacion>
      <p>Contenido de la pagina</p>
    </BarraNavegacion>,
    opciones
  );
}

describe("BarraNavegacion", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("muestra la marca, el nombre del usuario con su inicial y el contenido", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ nombre: "Julian Barrera" }));

    renderizarBarra();

    expect(screen.getByText("DevOpsEdu")).toBeInTheDocument();
    expect(screen.getByText("Julian Barrera")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.getByText("Contenido de la pagina")).toBeInTheDocument();
  });

  it("agrupa los enlaces del estudiante por categorias", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_ESTUDIANTE }));

    renderizarBarra();

    const general = screen.getByRole("list", { name: /general/i });
    expect(within(general).getByRole("link", { name: /panel principal/i })).toHaveAttribute(
      "href",
      "/"
    );

    const aprendizaje = screen.getByRole("list", { name: /aprendizaje/i });
    expect(within(aprendizaje).getByRole("link", { name: /mi ruta/i })).toHaveAttribute(
      "href",
      "/aprendizaje/mi-ruta"
    );

    const entorno = screen.getByRole("list", { name: /entorno/i });
    expect(within(entorno).getByRole("link", { name: /mis servicios/i })).toHaveAttribute(
      "href",
      "/servicios"
    );
    expect(
      within(entorno).getByRole("link", { name: /capacidad del servidor/i })
    ).toHaveAttribute("href", "/capacidad-servidor");

    const monitoreo = screen.getByRole("list", { name: /monitoreo/i });
    expect(within(monitoreo).getByRole("link", { name: /^histórico$/i })).toHaveAttribute(
      "href",
      "/monitoreo/historico"
    );
    expect(
      within(monitoreo).getByRole("link", { name: /gráficas de métricas/i })
    ).toHaveAttribute("href", "/monitoreo/metricas");

    const cuenta = screen.getByRole("list", { name: /cuenta/i });
    expect(within(cuenta).getByRole("link", { name: /perfil/i })).toHaveAttribute(
      "href",
      "/perfil"
    );
  });

  it("no muestra la categoria de Administracion al estudiante", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_ESTUDIANTE }));

    renderizarBarra();

    expect(screen.queryByRole("list", { name: /administración/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /módulos de aprendizaje/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /gestión de estudiantes/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^reportes$/i })).not.toBeInTheDocument();
  });

  it("muestra la categoria de Administracion solo al docente (RF-20, RF-21, RF-25)", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_DOCENTE }));

    renderizarBarra();

    const administracion = screen.getByRole("list", { name: /administración/i });
    expect(
      within(administracion).getByRole("link", { name: /módulos de aprendizaje/i })
    ).toHaveAttribute("href", "/administracion/modulos");
    expect(
      within(administracion).getByRole("link", { name: /gestión de estudiantes/i })
    ).toHaveAttribute("href", "/administracion/estudiantes");
    expect(within(administracion).getByRole("link", { name: /^reportes$/i })).toHaveAttribute(
      "href",
      "/administracion/reportes"
    );
  });

  it("oculta la categoria Aprendizaje al docente porque no tiene enlaces para el", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_DOCENTE }));

    renderizarBarra();

    expect(screen.queryByRole("list", { name: /^aprendizaje$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /mi ruta/i })).not.toBeInTheDocument();
  });

  it("resalta el enlace de la seccion activa", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarBarra({ rutaInicial: "/servicios" });

    expect(screen.getByRole("link", { name: /mis servicios/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: /panel principal/i })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("muestra el encabezado lateral recibido sobre las categorias", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarConProveedores(
      <BarraNavegacion encabezadoLateral={<p>Resumen de la ruta</p>}>
        <p>Contenido de la pagina</p>
      </BarraNavegacion>
    );

    const navegacion = screen.getByRole("navigation", { name: /navegación principal/i });
    expect(within(navegacion).getByText("Resumen de la ruta")).toBeInTheDocument();
  });
});
