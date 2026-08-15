// Cubre: RNF-03 — envuelve las rutas autenticadas con el patron unico de
// navegacion (BarraNavegacion) antes de renderizar la ruta anidada.
import { describe, it, expect, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../fixtures/usuario.factory";
import { DisenoAutenticado } from "@/enrutamiento/diseno-autenticado";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";

describe("DisenoAutenticado", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("muestra la barra de navegacion junto con el contenido de la ruta anidada", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarConProveedores(
      <Routes>
        <Route element={<DisenoAutenticado />}>
          <Route path="/pagina-de-prueba" element={<p>Contenido de la ruta</p>} />
        </Route>
      </Routes>,
      { rutaInicial: "/pagina-de-prueba" }
    );

    expect(screen.getByText("DevOpsEdu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mis servicios/i })).toBeInTheDocument();
    expect(screen.getByText("Contenido de la ruta")).toBeInTheDocument();
  });
});
