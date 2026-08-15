// Handlers por defecto de MSW para los grupos /api/auth, /api/servicios y
// /api/servidor (docs/contrato-api.md secciones 2, 3 y 4). Los tests de cada
// flujo pueden sobrescribir cualquiera de estos handlers con
// servidorMock.use() para probar casos particulares.
import { http, HttpResponse, type HttpHandler } from "msw";
import { configuracion } from "@/infraestructura/configuracion";
import type { Servicio, ServicioBasico } from "@/tipos/servicio";

const CORREO_VALIDO = "estudiante@devopsedu.local";
const CONTRASENA_VALIDA = "Clave_segura_1";

const SERVICIO_DE_PRUEBA: Servicio = {
  idServicio: 1,
  nombre: "postgres-clase-04",
  descripcion: "Base de datos para el curso",
  estado: "configurado",
  fechaCreacion: "2026-08-07T00:00:00.000Z",
  configuracion: {
    imagenDocker: "postgres:16-alpine",
    cpuAsignado: 1,
    memoriaAsignada: 512,
    almacenamientoAsignado: 1024,
    puertos: [],
    variablesEntorno: {},
    volumenes: [],
  },
};

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

  http.get(`${configuracion.prefijoApi}/servicios/imagenes`, () =>
    HttpResponse.json([
      { nombre: "postgres:16-alpine", descripcion: "Base de datos PostgreSQL 16" },
      { nombre: "mysql:8", descripcion: "Base de datos MySQL 8" },
      { nombre: "mongo:7", descripcion: "Base de datos MongoDB 7" },
      { nombre: "redis:7-alpine", descripcion: "Almacen en memoria Redis 7" },
      { nombre: "nginx:1.27-alpine", descripcion: "Servidor web Nginx" },
      { nombre: "httpd:2.4-alpine", descripcion: "Servidor web Apache HTTP" },
      { nombre: "node:20-alpine", descripcion: "Entorno de ejecucion Node.js 20" },
    ])
  ),

  http.get(`${configuracion.prefijoApi}/servicios`, () =>
    HttpResponse.json([SERVICIO_DE_PRUEBA])
  ),

  http.post(`${configuracion.prefijoApi}/servicios`, async ({ request }) => {
    const cuerpo = (await request.json()) as Partial<Servicio>;
    return HttpResponse.json(
      {
        ...SERVICIO_DE_PRUEBA,
        idServicio: 2,
        nombre: cuerpo.nombre ?? SERVICIO_DE_PRUEBA.nombre,
        estado: "configurado",
      },
      { status: 201 }
    );
  }),

  http.get(`${configuracion.prefijoApi}/servicios/:idServicio`, ({ params }) =>
    HttpResponse.json({
      ...SERVICIO_DE_PRUEBA,
      idServicio: Number(params["idServicio"]),
      registros: [],
    })
  ),

  http.post(
    `${configuracion.prefijoApi}/servicios/:idServicio/desplegar`,
    ({ params }) =>
      HttpResponse.json<ServicioBasico>({
        idServicio: Number(params["idServicio"]),
        nombre: SERVICIO_DE_PRUEBA.nombre,
        estado: "en_ejecucion",
      })
  ),

  http.post(
    `${configuracion.prefijoApi}/servicios/:idServicio/detener`,
    ({ params }) =>
      HttpResponse.json<ServicioBasico>({
        idServicio: Number(params["idServicio"]),
        nombre: SERVICIO_DE_PRUEBA.nombre,
        estado: "detenido",
      })
  ),

  http.post(
    `${configuracion.prefijoApi}/servicios/:idServicio/reiniciar`,
    ({ params }) =>
      HttpResponse.json<ServicioBasico>({
        idServicio: Number(params["idServicio"]),
        nombre: SERVICIO_DE_PRUEBA.nombre,
        estado: "en_ejecucion",
      })
  ),

  http.delete(`${configuracion.prefijoApi}/servicios/:idServicio`, ({ params }) =>
    HttpResponse.json<ServicioBasico>({
      idServicio: Number(params["idServicio"]),
      nombre: SERVICIO_DE_PRUEBA.nombre,
      estado: "eliminado",
    })
  ),

  http.get(`${configuracion.prefijoApi}/servicios/:idServicio/metricas`, () =>
    HttpResponse.json([
      {
        idMetrica: 1,
        consumoCpu: 0.35,
        consumoMemoria: 128,
        estadoEjecucion: "en_ejecucion",
        marcaTiempo: "2026-08-07T00:10:00.000Z",
      },
    ])
  ),

  http.get(`${configuracion.prefijoApi}/servidor/capacidad`, () =>
    HttpResponse.json({
      total: { cpu: 8, memoria: 16384, almacenamiento: 512000 },
      comprometido: { cpu: 2.5, memoria: 4096, almacenamiento: 20480 },
      disponible: { cpu: 5.5, memoria: 12288, almacenamiento: 491520 },
    })
  ),
];
