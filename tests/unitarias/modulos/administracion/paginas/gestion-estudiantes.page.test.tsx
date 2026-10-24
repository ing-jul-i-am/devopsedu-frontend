// Cubre: RF-21, RF-25 — CU-11 (asignacion de rutas, eligiendo al estudiante
// del listado 7.2) + DT-08 (reseteo de contrasena, sin RF/CU formal asignado,
// ver docs/decisiones-tecnicas.md DT-10 y DT-20)
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { crearModuloDePrueba } from "../../../../fixtures/aprendizaje.factory";
import { crearEstudianteListadoDePrueba } from "../../../../fixtures/reporte.factory";
import { GestionEstudiantesPage } from "@/modulos/administracion/paginas/gestion-estudiantes.page";
import { configuracion } from "@/infraestructura/configuracion";

const rutaModulos = `${configuracion.prefijoApi}/modulos`;
const rutaRutas = `${configuracion.prefijoApi}/rutas`;
const rutaEstudiantes = `${configuracion.prefijoApi}/usuarios/estudiantes`;

function rutaContrasena(id: number) {
  return `${configuracion.prefijoApi}/usuarios/${id}/contrasena`;
}

const LUIS = crearEstudianteListadoDePrueba({
  idUsuario: 5,
  nombre: "Luis Estudiante",
  correo: "luis@devopsedu.local",
  ruta: {
    idRuta: 1,
    fechaAsignacion: "2026-02-01T10:00:00.000Z",
    progreso: 50,
    totalModulos: 2,
    modulosCompletados: 1,
  },
});

const BEATRIZ = crearEstudianteListadoDePrueba({
  idUsuario: 3,
  nombre: "Beatriz Estudiante",
  correo: "beatriz@devopsedu.local",
  ruta: null,
});

function usarModulos() {
  servidorMock.use(
    http.get(rutaModulos, () =>
      HttpResponse.json([
        crearModuloDePrueba({ idModulo: 1, nombre: "Introduccion a contenedores" }),
        crearModuloDePrueba({ idModulo: 2, nombre: "Redes en Docker" }),
      ])
    )
  );
}

function usarEstudiantes() {
  servidorMock.use(http.get(rutaEstudiantes, () => HttpResponse.json([BEATRIZ, LUIS])));
}

async function elegirEstudiante(
  usuario: ReturnType<typeof userEvent.setup>,
  idUsuario: number
) {
  await screen.findByRole("option", { name: "Luis Estudiante (luis@devopsedu.local)" });
  await usuario.selectOptions(screen.getByLabelText("Estudiante"), String(idUsuario));
}

describe("GestionEstudiantesPage", () => {
  it("lista los estudiantes por nombre y correo y los modulos disponibles", async () => {
    usarModulos();
    usarEstudiantes();

    renderizarConProveedores(<GestionEstudiantesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Gestión de estudiantes" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "Luis Estudiante (luis@devopsedu.local)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Beatriz Estudiante (beatriz@devopsedu.local)" })
    ).toBeInTheDocument();
    expect(await screen.findByLabelText("Introduccion a contenedores")).toBeInTheDocument();
    expect(screen.getByLabelText("Redes en Docker")).toBeInTheDocument();
  });

  it("muestra un indicador mientras carga los estudiantes", () => {
    usarModulos();
    servidorMock.use(
      http.get(rutaEstudiantes, async () => {
        await new Promise((resolver) => setTimeout(resolver, 200));
        return HttpResponse.json([]);
      })
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    expect(screen.getByRole("status", { name: /cargando estudiantes/i })).toBeInTheDocument();
  });

  it("indica cuando no hay estudiantes registrados", async () => {
    usarModulos();
    servidorMock.use(http.get(rutaEstudiantes, () => HttpResponse.json([])));

    renderizarConProveedores(<GestionEstudiantesPage />);

    expect(await screen.findByText(/no hay estudiantes registrados/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Estudiante")).not.toBeInTheDocument();
  });

  it("muestra un error cuando no se puede cargar el listado de estudiantes", async () => {
    usarModulos();
    servidorMock.use(
      http.get(rutaEstudiantes, () => HttpResponse.json({ error: "Error" }, { status: 500 }))
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    expect(
      await screen.findByText(/no fue posible cargar el listado de estudiantes/i)
    ).toBeInTheDocument();
  });

  it("muestra la ruta vigente del estudiante elegido", async () => {
    const usuario = userEvent.setup();
    usarModulos();
    usarEstudiantes();

    renderizarConProveedores(<GestionEstudiantesPage />);

    await elegirEstudiante(usuario, 5);
    expect(
      screen.getByRole("progressbar", { name: /progreso de la ruta de luis estudiante/i })
    ).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText(/1 de 2 módulos completados/i)).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Estudiante"), "3");
    expect(screen.getByText(/sin ruta asignada/i)).toBeInTheDocument();
  });

  it("no permite asignar una ruta sin elegir estudiante", async () => {
    usarModulos();
    usarEstudiantes();

    renderizarConProveedores(<GestionEstudiantesPage />);

    await screen.findByRole("option", { name: "Luis Estudiante (luis@devopsedu.local)" });
    expect(screen.getByRole("button", { name: /asignar ruta/i })).toBeDisabled();
  });

  it("asigna una ruta con los modulos seleccionados en orden", async () => {
    const usuario = userEvent.setup();
    usarModulos();
    usarEstudiantes();
    servidorMock.use(
      http.post(rutaRutas, async ({ request }) => {
        const cuerpo = (await request.json()) as { idUsuario: number; idModulos: number[] };
        expect(cuerpo).toEqual({ idUsuario: 5, idModulos: [2, 1] });
        return HttpResponse.json(
          {
            idRuta: 1,
            idUsuario: 5,
            progreso: 0,
            fechaAsignacion: "2026-08-28T00:00:00.000Z",
            modulos: [],
          },
          { status: 201 }
        );
      })
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    await elegirEstudiante(usuario, 5);
    await usuario.click(await screen.findByLabelText("Redes en Docker"));
    await usuario.click(screen.getByLabelText("Introduccion a contenedores"));

    const orden = screen.getByRole("list", { name: /orden de la ruta/i });
    expect(orden).toHaveTextContent(/1\s*Redes en Docker\s*2\s*Introduccion a contenedores/);

    await usuario.click(screen.getByRole("button", { name: /asignar ruta/i }));

    expect(await screen.findByText(/ruta asignada correctamente/i)).toBeInTheDocument();
  });

  it("muestra el error del backend cuando no se puede asignar la ruta", async () => {
    const usuario = userEvent.setup();
    usarModulos();
    usarEstudiantes();
    servidorMock.use(
      http.post(rutaRutas, () =>
        HttpResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      )
    );

    renderizarConProveedores(<GestionEstudiantesPage />);

    await elegirEstudiante(usuario, 5);
    await usuario.click(await screen.findByLabelText("Introduccion a contenedores"));
    await usuario.click(screen.getByRole("button", { name: /asignar ruta/i }));

    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument();
  });

  it("restablece la contraseña del estudiante tras confirmar la accion", async () => {
    const usuario = userEvent.setup();
    servidorMock.use(
      http.get(rutaModulos, () => HttpResponse.json([])),
      http.patch(rutaContrasena(5), async ({ request }) => {
        const cuerpo = (await request.json()) as { contrasenaNueva: string };
        expect(cuerpo).toEqual({ contrasenaNueva: "Clave_temporal_1" });
        return HttpResponse.json({ mensaje: "Contrasena actualizada" });
      })
    );
    usarEstudiantes();

    renderizarConProveedores(<GestionEstudiantesPage />);

    await elegirEstudiante(usuario, 5);
    await usuario.type(screen.getByLabelText(/nueva contraseña/i), "Clave_temporal_1");
    await usuario.click(screen.getByRole("button", { name: /restablecer contraseña/i }));
    await usuario.click(screen.getByRole("button", { name: /^restablecer$/i }));

    expect(
      await screen.findByText(/contraseña actualizada correctamente/i)
    ).toBeInTheDocument();
  });
});
