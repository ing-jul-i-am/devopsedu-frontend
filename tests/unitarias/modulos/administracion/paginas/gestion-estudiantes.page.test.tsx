// Cubre: RF-21 — CU-11 (asignacion de rutas) + DT-08 (reseteo de contrasena,
// sin RF/CU formal asignado, ver docs/decisiones-tecnicas.md)
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearModuloDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { GestionEstudiantesPage } from "@/modulos/administracion/paginas/gestion-estudiantes.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaModulos = `${configuracion.prefijoApi}/modulos`;
const rutaRutas = `${configuracion.prefijoApi}/rutas`;

function rutaContrasena(id: number) {
  return `${configuracion.prefijoApi}/usuarios/${id}/contrasena`;
}

describe("GestionEstudiantesPage", () => {
  it("muestra el campo de id de estudiante y los modulos disponibles", async () => {
    servidorMock.use(
      http.get(rutaModulos, () =>
        HttpResponse.json([
          crearModuloDePrueba({ idModulo: 1, nombre: "Introduccion a contenedores" }),
          crearModuloDePrueba({ idModulo: 2, nombre: "Redes en Docker" }),
        ])
      )
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    expect(screen.getByLabelText(/id del estudiante/i)).toBeInTheDocument();
    expect(await screen.findByLabelText("Introduccion a contenedores")).toBeInTheDocument();
    expect(screen.getByLabelText("Redes en Docker")).toBeInTheDocument();
  });

  it("asigna una ruta con los modulos seleccionados en orden", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaModulos, () =>
        HttpResponse.json([
          crearModuloDePrueba({ idModulo: 1, nombre: "Introduccion a contenedores" }),
          crearModuloDePrueba({ idModulo: 2, nombre: "Redes en Docker" }),
        ])
      ),
      http.post(rutaRutas, async ({ request }) => {
        const cuerpo = (await request.json()) as { idUsuario: number; idModulos: number[] };
        expect(cuerpo).toEqual({ idUsuario: 5, idModulos: [2, 1] });
        return HttpResponse.json(
          { idRuta: 1, idUsuario: 5, progreso: 0, fechaAsignacion: "2026-08-28T00:00:00.000Z", modulos: [] },
          { status: 201 }
        );
      })
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    await usuario.type(screen.getByLabelText(/id del estudiante/i), "5");
    await screen.findByLabelText("Introduccion a contenedores");
    await usuario.click(screen.getByLabelText("Redes en Docker"));
    await usuario.click(screen.getByLabelText("Introduccion a contenedores"));
    await usuario.click(screen.getByRole("button", { name: /asignar ruta/i }));

    expect(await screen.findByText(/ruta asignada correctamente/i)).toBeInTheDocument();
  });

  it("muestra un mensaje claro cuando el estudiante no existe", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaModulos, () =>
        HttpResponse.json([crearModuloDePrueba({ idModulo: 1, nombre: "Introduccion" })])
      ),
      http.post(rutaRutas, () =>
        HttpResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      )
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    await usuario.type(screen.getByLabelText(/id del estudiante/i), "999");
    await usuario.click(await screen.findByLabelText("Introduccion"));
    await usuario.click(screen.getByRole("button", { name: /asignar ruta/i }));

    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument();
  });

  it("restablece la contrasena del estudiante tras confirmar la accion", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaModulos, () => HttpResponse.json([])),
      http.patch(rutaContrasena(5), async ({ request }) => {
        const cuerpo = (await request.json()) as { contrasenaNueva: string };
        expect(cuerpo).toEqual({ contrasenaNueva: "Clave_temporal_1" });
        return HttpResponse.json({ mensaje: "Contrasena actualizada" });
      })
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    await usuario.type(screen.getByLabelText(/id del estudiante/i), "5");
    await usuario.type(screen.getByLabelText(/nueva contrasena/i), "Clave_temporal_1");
    await usuario.click(screen.getByRole("button", { name: /restablecer contrasena/i }));
    await usuario.click(screen.getByRole("button", { name: /^restablecer$/i }));

    expect(await screen.findByText(/contrasena actualizada/i)).toBeInTheDocument();
  });
});
