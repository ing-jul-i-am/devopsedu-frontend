// Cubre: RF-01, RNF-02, RNF-05 — DT-01 (sin campo de rol)
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { RegistroPage } from "@/modulos/sesion/paginas/registro.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaRegistro = `${configuracion.prefijoApi}/auth/registro`;

async function completarFormularioValido(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText(/nombre/i), "Julian Barrera");
  await usuario.type(screen.getByLabelText(/correo/i), "julian@devopsedu.local");
  await usuario.type(screen.getByLabelText(/contrase/i), "Clave_segura_1");
}

describe("RegistroPage", () => {
  it("muestra los campos nombre, correo y contraseña, sin un campo de rol", () => {
    renderizarConProveedores(<RegistroPage />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrase/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/rol/i)).not.toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando el nombre tiene menos de 2 caracteres", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(<RegistroPage />);

    await usuario.type(screen.getByLabelText(/nombre/i), "A");
    await usuario.tab();

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error cuando la contraseña tiene menos de 8 caracteres", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(<RegistroPage />);

    await usuario.type(screen.getByLabelText(/contrase/i), "corta1");
    await usuario.tab();

    expect(await screen.findByText(/al menos 8 caracteres/i)).toBeInTheDocument();
  });

  it("muestra la confirmacion y un enlace a iniciar sesion tras un registro exitoso", async () => {
    servidorMock.use(
      http.post(rutaRegistro, () =>
        HttpResponse.json(
          {
            usuario: {
              idUsuario: 1,
              nombre: "Julian Barrera",
              correo: "julian@devopsedu.local",
              fechaRegistro: "2026-08-14T00:00:00.000Z",
              idRol: 1,
            },
          },
          { status: 201 }
        )
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<RegistroPage />);
    await completarFormularioValido(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/cuenta creada/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el correo ya esta registrado", async () => {
    servidorMock.use(
      http.post(rutaRegistro, () =>
        HttpResponse.json({ error: "El correo ya esta registrado" }, { status: 409 })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<RegistroPage />);
    await completarFormularioValido(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/el correo ya esta registrado/i)).toBeInTheDocument();
  });

  it("mapea los errores de validacion del backend al campo correspondiente", async () => {
    servidorMock.use(
      http.post(rutaRegistro, () =>
        HttpResponse.json(
          {
            error: "Datos de entrada invalidos",
            detalles: [{ campo: "correo", mensaje: "El correo ya tiene un formato invalido" }],
          },
          { status: 400 }
        )
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<RegistroPage />);
    await completarFormularioValido(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(
      await screen.findByText(/el correo ya tiene un formato invalido/i)
    ).toBeInTheDocument();
  });
});
