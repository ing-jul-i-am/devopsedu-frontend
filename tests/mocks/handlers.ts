// Handlers por defecto de MSW para los grupos /api/auth, /api/servicios,
// /api/servidor, /api/modulos, /api/rutas, /api/aprendizaje y /api/usuarios
// (docs/contrato-api.md secciones 2, 3, 4, 5, 6, 7 y 8). Los tests de cada
// flujo pueden sobrescribir cualquiera de estos handlers con
// servidorMock.use() para probar casos particulares.
import { http, HttpResponse, type HttpHandler } from "msw";
import { configuracion } from "@/infraestructura/configuracion";
import type { ResultadoOperacion, Servicio, ServicioBasico } from "@/tipos/servicio";
import type { Modulo } from "@/tipos/aprendizaje";

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

const MODULO_DE_PRUEBA: Modulo = {
  idModulo: 1,
  nombre: "Introduccion a contenedores",
  contenido: [{ tipo: "texto", contenido: "Los contenedores empaquetan una aplicacion." }],
  orden: 1,
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
      contenedor: { existe: false, volumenes: [] },
      registros: [],
    })
  ),

  http.put(
    `${configuracion.prefijoApi}/servicios/:idServicio/configuracion`,
    async ({ params, request }) => {
      const cuerpo = (await request.json()) as { configuracion: Servicio["configuracion"] };
      return HttpResponse.json({
        ...SERVICIO_DE_PRUEBA,
        idServicio: Number(params["idServicio"]),
        configuracion: cuerpo.configuracion,
      });
    }
  ),

  http.post(`${configuracion.prefijoApi}/servicios/:idServicio/desplegar`, ({ params }) =>
    HttpResponse.json<ResultadoOperacion>({
      idServicio: Number(params["idServicio"]),
      nombre: SERVICIO_DE_PRUEBA.nombre,
      estado: "en_ejecucion",
      recreado: false,
      volumenesEliminados: [],
      volumenesOmitidos: [],
    })
  ),

  http.post(`${configuracion.prefijoApi}/servicios/:idServicio/detener`, ({ params }) =>
    HttpResponse.json<ServicioBasico>({
      idServicio: Number(params["idServicio"]),
      nombre: SERVICIO_DE_PRUEBA.nombre,
      estado: "detenido",
    })
  ),

  http.post(`${configuracion.prefijoApi}/servicios/:idServicio/reiniciar`, ({ params }) =>
    HttpResponse.json<ServicioBasico>({
      idServicio: Number(params["idServicio"]),
      nombre: SERVICIO_DE_PRUEBA.nombre,
      estado: "en_ejecucion",
    })
  ),

  http.delete(`${configuracion.prefijoApi}/servicios/:idServicio`, ({ params }) =>
    HttpResponse.json<ResultadoOperacion>({
      idServicio: Number(params["idServicio"]),
      nombre: SERVICIO_DE_PRUEBA.nombre,
      estado: "eliminado",
      recreado: false,
      volumenesEliminados: [],
      volumenesOmitidos: [],
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

  http.get(`${configuracion.prefijoApi}/modulos`, () => HttpResponse.json([MODULO_DE_PRUEBA])),

  http.get(`${configuracion.prefijoApi}/modulos/:idModulo`, ({ params }) =>
    HttpResponse.json({ ...MODULO_DE_PRUEBA, idModulo: Number(params["idModulo"]) })
  ),

  http.post(`${configuracion.prefijoApi}/modulos`, async ({ request }) => {
    const cuerpo = (await request.json()) as Partial<Modulo>;
    return HttpResponse.json(
      { ...MODULO_DE_PRUEBA, idModulo: 2, nombre: cuerpo.nombre ?? MODULO_DE_PRUEBA.nombre },
      { status: 201 }
    );
  }),

  http.put(`${configuracion.prefijoApi}/modulos/:idModulo`, async ({ params, request }) => {
    const cuerpo = (await request.json()) as Partial<Modulo>;
    return HttpResponse.json({
      ...MODULO_DE_PRUEBA,
      idModulo: Number(params["idModulo"]),
      ...cuerpo,
    });
  }),

  http.post(`${configuracion.prefijoApi}/modulos/imagenes`, () =>
    HttpResponse.json({ url: "/archivos/modulos/imagen-de-prueba.png" }, { status: 201 })
  ),

  http.post(
    `${configuracion.prefijoApi}/modulos/:idModulo/actividades`,
    async ({ params, request }) => {
      const cuerpo = (await request.json()) as { descripcion?: string; orden?: number };
      return HttpResponse.json(
        {
          idActividad: 1,
          descripcion: cuerpo.descripcion ?? "",
          criteriosValidacion: { operacion: "desplegar" },
          orden: cuerpo.orden ?? 1,
          idModulo: Number(params["idModulo"]),
        },
        { status: 201 }
      );
    }
  ),

  http.post(
    `${configuracion.prefijoApi}/modulos/:idModulo/evaluacion`,
    async ({ params, request }) => {
      const cuerpo = (await request.json()) as {
        titulo?: string;
        preguntas?: unknown[];
        fechaDisponible?: string;
      };
      return HttpResponse.json(
        {
          idEvaluacion: 1,
          titulo: cuerpo.titulo ?? "",
          preguntas: cuerpo.preguntas ?? [],
          fechaDisponible: cuerpo.fechaDisponible ?? new Date().toISOString(),
          idModulo: Number(params["idModulo"]),
        },
        { status: 201 }
      );
    }
  ),

  http.post(`${configuracion.prefijoApi}/rutas`, async ({ request }) => {
    const cuerpo = (await request.json()) as { idUsuario?: number; idModulos?: number[] };
    return HttpResponse.json(
      {
        idRuta: 1,
        idUsuario: cuerpo.idUsuario ?? 0,
        progreso: 0,
        fechaAsignacion: new Date().toISOString(),
        modulos: (cuerpo.idModulos ?? []).map((idModulo, indice) => ({
          idModulo,
          ordenSecuencia: indice + 1,
        })),
      },
      { status: 201 }
    );
  }),

  http.get(`${configuracion.prefijoApi}/aprendizaje/mi-ruta`, () => HttpResponse.json(null)),

  http.get(`${configuracion.prefijoApi}/aprendizaje/modulos/:idModulo`, ({ params }) =>
    HttpResponse.json({
      idModulo: Number(params["idModulo"]),
      nombre: MODULO_DE_PRUEBA.nombre,
      orden: MODULO_DE_PRUEBA.orden,
      fechaInicio: null,
      contenido: MODULO_DE_PRUEBA.contenido,
    })
  ),

  http.post(`${configuracion.prefijoApi}/aprendizaje/modulos/:idModulo/iniciar`, () =>
    HttpResponse.json({ mensaje: "Modulo iniciado" })
  ),

  http.get(`${configuracion.prefijoApi}/aprendizaje/modulos/:idModulo/evaluacion`, () =>
    HttpResponse.json({
      idEvaluacion: 1,
      titulo: "Evaluacion de prueba",
      fechaDisponible: "2026-01-01T00:00:00.000Z",
      preguntas: [{ pregunta: "Pregunta de prueba", opciones: ["A", "B"] }],
    })
  ),

  http.post(`${configuracion.prefijoApi}/aprendizaje/modulos/:idModulo/evaluacion`, () =>
    HttpResponse.json({
      puntuacion: 100,
      aprobado: true,
      intentosRestantes: 2,
      detalle: [{ correcta: true }],
    })
  ),

  http.patch(`${configuracion.prefijoApi}/usuarios/:idUsuario/contrasena`, () =>
    HttpResponse.json({ mensaje: "Contrasena actualizada" })
  ),
];
