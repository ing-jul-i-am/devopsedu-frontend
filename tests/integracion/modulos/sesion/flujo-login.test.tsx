// Cubre: RF-02 — CU-01
import { describe, it, expect, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../mocks/servidor";
import { renderizarConProveedores } from "../../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../../fixtures/usuario.factory";
import App from "@/App";
import { configuracion } from "@/infraestructura/configuracion";
import { limpiarSesion } from "@/infraestructura/almacenamiento-sesion";

const rutaLogin = `${configuracion.prefijoApi}/auth/login`;

describe("Flujo de inicio de sesion", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("redirige a la pagina principal tras un inicio de sesion exitoso", async () => {
    const usuarioDePrueba = crearUsuarioDePrueba();
    servidorMock.use(
      http.post(rutaLogin, () =>
        HttpResponse.json({ token: "jwt-de-prueba", usuario: usuarioDePrueba })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/iniciar-sesion" });

    await usuario.type(screen.getByLabelText(/correo/i), usuarioDePrueba.correo);
    await usuario.type(screen.getByLabelText(/contrase/i), "Clave_segura_1");
    await usuario.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("DevOpsEdu")).toBeInTheDocument();
  });

  it("muestra el mensaje de credenciales invalidas cuando el backend responde 401", async () => {
    servidorMock.use(
      http.post(rutaLogin, () =>
        HttpResponse.json({ error: "Credenciales invalidas" }, { status: 401 })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/iniciar-sesion" });

    await usuario.type(screen.getByLabelText(/correo/i), "estudiante@devopsedu.local");
    await usuario.type(screen.getByLabelText(/contrase/i), "Clave_segura_1");
    await usuario.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/credenciales invalidas/i)).toBeInTheDocument();
  });
});
