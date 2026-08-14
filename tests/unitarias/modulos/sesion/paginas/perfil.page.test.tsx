// Cubre: RF-03, RNF-05 — CU-02. RF-04 (edicion de perfil) no implementado, ver DT-02.
import { describe, it, expect, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../../../fixtures/usuario.factory";
import { PerfilPage } from "@/modulos/sesion/paginas/perfil.page";
import { configuracion } from "@/infraestructura/configuracion";
import { guardarSesion, limpiarSesion, obtenerToken } from "@/infraestructura/almacenamiento-sesion";

const rutaLogout = `${configuracion.prefijoApi}/auth/logout`;

describe("PerfilPage", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("muestra el nombre y el correo del usuario autenticado", () => {
    const usuario = crearUsuarioDePrueba({ nombre: "Julian Barrera" });
    guardarSesion("token-de-prueba", usuario);

    renderizarConProveedores(<PerfilPage />);

    expect(screen.getByText("Julian Barrera")).toBeInTheDocument();
    expect(screen.getByText(usuario.correo)).toBeInTheDocument();
  });

  it("muestra un mensaje cuando no hay una sesion activa", () => {
    renderizarConProveedores(<PerfilPage />);

    expect(screen.getByText(/no hay una sesion activa/i)).toBeInTheDocument();
  });

  it("cierra la sesion al hacer clic en el boton de cerrar sesion", async () => {
    servidorMock.use(
      http.post(rutaLogout, () => HttpResponse.json({ mensaje: "Sesion cerrada" }))
    );
    guardarSesion("token-de-prueba", crearUsuarioDePrueba());

    const usuario = userEvent.setup();
    renderizarConProveedores(<PerfilPage />);

    await usuario.click(screen.getByRole("button", { name: /cerrar sesion/i }));

    await waitFor(() => expect(obtenerToken()).toBeNull());
  });
});
