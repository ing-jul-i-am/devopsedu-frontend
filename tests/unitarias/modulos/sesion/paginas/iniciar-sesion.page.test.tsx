// Cubre: RF-02, RNF-02, RNF-05 — CU-01
import { describe, it, expect, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearUsuarioDePrueba } from "../../../../fixtures/usuario.factory";
import { IniciarSesionPage } from "@/modulos/sesion/paginas/iniciar-sesion.page";
import { configuracion } from "@/infraestructura/configuracion";
import { limpiarSesion, obtenerToken } from "@/infraestructura/almacenamiento-sesion";

const rutaLogin = `${configuracion.prefijoApi}/auth/login`;

describe("IniciarSesionPage", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("muestra los campos correo, contraseña, recordar sesion y el enlace a registro", () => {
    renderizarConProveedores(<IniciarSesionPage />);

    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrase/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recordar sesion/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registr/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando el correo tiene formato invalido", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(<IniciarSesionPage />);

    await usuario.type(screen.getByLabelText(/correo/i), "no-es-correo");
    await usuario.tab();

    expect(await screen.findByText(/correo invalido/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando la contraseña esta vacia tras perder el foco", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(<IniciarSesionPage />);

    await usuario.click(screen.getByLabelText(/contrase/i));
    await usuario.tab();

    expect(await screen.findByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
  });

  it("guarda la sesion tras un inicio de sesion exitoso", async () => {
    const usuarioDePrueba = crearUsuarioDePrueba();
    servidorMock.use(
      http.post(rutaLogin, () =>
        HttpResponse.json({ token: "jwt-de-prueba", usuario: usuarioDePrueba })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<IniciarSesionPage />);

    await usuario.type(screen.getByLabelText(/correo/i), usuarioDePrueba.correo);
    await usuario.type(screen.getByLabelText(/contrase/i), "Clave_segura_1");
    await usuario.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(obtenerToken()).toBe("jwt-de-prueba"));
  });

  it("muestra un mensaje de credenciales invalidas cuando el backend responde 401", async () => {
    servidorMock.use(
      http.post(rutaLogin, () =>
        HttpResponse.json({ error: "Credenciales invalidas" }, { status: 401 })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<IniciarSesionPage />);

    await usuario.type(screen.getByLabelText(/correo/i), "estudiante@devopsedu.local");
    await usuario.type(screen.getByLabelText(/contrase/i), "Clave_segura_1");
    await usuario.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/credenciales invalidas/i)).toBeInTheDocument();
  });
});
