import { afterEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../fixtures/usuario.factory";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import App from "@/App";

describe("App", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("redirige a iniciar sesion en la ruta raiz cuando no hay sesion activa", () => {
    renderizarConProveedores(<App />);

    expect(screen.getByRole("heading", { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  it("muestra el panel principal en la ruta raiz cuando hay sesion activa", () => {
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    renderizarConProveedores(<App />);

    expect(screen.getByText("DevOpsEdu")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /bienvenido/i })).toBeInTheDocument();
  });
});
