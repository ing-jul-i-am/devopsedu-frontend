// Handlers por defecto de MSW para el grupo /api/auth (docs/contrato-api.md
// seccion 2). Los tests de cada flujo pueden sobrescribir cualquiera de
// estos handlers con servidorMock.use() para probar casos particulares.
import { http, HttpResponse, type HttpHandler } from "msw";
import { configuracion } from "@/infraestructura/configuracion";

const CORREO_VALIDO = "estudiante@devopsedu.local";
const CONTRASENA_VALIDA = "Clave_segura_1";

export const handlers: HttpHandler[] = [
  http.post(`${configuracion.prefijoApi}/auth/login`, async ({ request }) => {
    const cuerpo = (await request.json()) as { correo?: string; contrasena?: string };

    if (cuerpo.correo === CORREO_VALIDO && cuerpo.contrasena === CONTRASENA_VALIDA) {
      return HttpResponse.json({
        token: "jwt-de-prueba",
        usuario: {
          idUsuario: 1,
          nombre: "Estudiante de prueba",
          correo: CORREO_VALIDO,
          fechaRegistro: "2026-08-07T00:00:00.000Z",
          idRol: 1,
        },
      });
    }

    return HttpResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
  }),

  http.post(`${configuracion.prefijoApi}/auth/registro`, async ({ request }) => {
    const cuerpo = (await request.json()) as { nombre?: string; correo?: string };

    if (cuerpo.correo === CORREO_VALIDO) {
      return HttpResponse.json({ error: "El correo ya esta registrado" }, { status: 409 });
    }

    return HttpResponse.json(
      {
        usuario: {
          idUsuario: 2,
          nombre: cuerpo.nombre ?? "",
          correo: cuerpo.correo ?? "",
          fechaRegistro: new Date().toISOString(),
          idRol: 1,
        },
      },
      { status: 201 }
    );
  }),

  http.post(`${configuracion.prefijoApi}/auth/logout`, () =>
    HttpResponse.json({ mensaje: "Sesion cerrada" })
  ),
];
