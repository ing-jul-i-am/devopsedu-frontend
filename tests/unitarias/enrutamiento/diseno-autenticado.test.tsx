// Cubre: RNF-03, RF-22 — envuelve las rutas autenticadas con el patron unico de
// navegacion (BarraNavegacion) antes de renderizar la ruta anidada, y agrega el
// resumen de la ruta de aprendizaje solo para el estudiante (DT-17).
import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../mocks/servidor";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../fixtures/usuario.factory";
import { crearMiRutaDePrueba } from "../../fixtures/aprendizaje.factory";
import { DisenoAutenticado } from "@/enrutamiento/diseno-autenticado";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { configuracion } from "@/infraestructura/configuracion";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

const rutaMiRuta = `${configuracion.prefijoApi}/aprendizaje/mi-ruta`;

function renderizarDiseno() {
  return renderizarConProveedores(
    <Routes>
      <Route element={<DisenoAutenticado />}>
        <Route path="/pagina-de-prueba" element={<p>Contenido de la ruta</p>} />
      </Route>
    </Routes>,
    { rutaInicial: "/pagina-de-prueba" }
  );
}

describe("DisenoAutenticado", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("muestra la barra de navegacion junto con el contenido de la ruta anidada", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarDiseno();

    expect(screen.getByText("DevOpsEdu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mis servicios/i })).toBeInTheDocument();
    expect(screen.getByText("Contenido de la ruta")).toBeInTheDocument();
  });

  it("muestra el resumen de la ruta en la barra lateral al estudiante", async () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_ESTUDIANTE }));
    servidorMock.use(
      http.get(rutaMiRuta, () =>
        HttpResponse.json(
          crearMiRutaDePrueba({
            progreso: 100,
            modulos: [
              { idModulo: 1, nombre: "Introduccion", ordenSecuencia: 1, estado: "completado" },
            ],
          })
        )
      )
    );

    renderizarDiseno();

    expect(await screen.findByText(/1 de 1 módulos completados/i)).toBeInTheDocument();
  });

  it("no consulta la ruta de aprendizaje para el docente", async () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba({ idRol: ID_ROL_DOCENTE }));
    const consultaRuta = vi.fn();
    servidorMock.use(
      http.get(rutaMiRuta, () => {
        consultaRuta();
        return HttpResponse.json(null, { status: 403 });
      })
    );

    renderizarDiseno();

    expect(await screen.findByText("Contenido de la ruta")).toBeInTheDocument();
    expect(consultaRuta).not.toHaveBeenCalled();
    expect(screen.queryByText(/módulos completados/i)).not.toBeInTheDocument();
  });
});
