// Cubre: RF-02, RF-03 — CU-01, CU-02
import { describe, it, expect, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { renderizarConProveedores } from "../../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../../fixtures/usuario.factory";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";

describe("Flujo de perfil y cierre de sesion", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("redirige a inicio de sesion cuando se visita perfil sin sesion activa", () => {
    renderizarConProveedores(<App />, { rutaInicial: "/perfil" });

    expect(screen.getByRole("heading", { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  it("muestra el perfil y redirige a inicio de sesion al cerrar sesion", async () => {
    const usuario = crearUsuarioDePrueba({ nombre: "Julian Barrera" });
    guardarSesion("token-de-prueba", usuario);

    const usuarioInteraccion = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/perfil" });

    expect(await screen.findByRole("heading", { name: /mi perfil/i })).toBeInTheDocument();
    expect(screen.getAllByText("Julian Barrera").length).toBeGreaterThan(0);

    await usuarioInteraccion.click(screen.getByRole("button", { name: /cerrar sesion/i }));

    expect(await screen.findByRole("heading", { name: /iniciar sesion/i })).toBeInTheDocument();
  });
});
