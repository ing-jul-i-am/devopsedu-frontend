import type {
  EstadoContenedor,
  Servicio,
  ServicioDetalle,
  VolumenConTipo,
  VolumenMontado,
} from "@/tipos/servicio";

let contador = 0;

export function crearVolumenDePrueba(
  sobreescrituras: Partial<VolumenConTipo> = {}
): VolumenConTipo {
  return {
    origen: "/datos/pg",
    destino: "/var/lib/postgresql/data",
    modo: "rw",
    tipo: "bind",
    ...sobreescrituras,
  };
}

export function crearVolumenMontadoDePrueba(
  sobreescrituras: Partial<VolumenMontado> = {}
): VolumenMontado {
  return {
    nombre: "datos-redis",
    destino: "/data",
    anonimo: false,
    ...sobreescrituras,
  };
}

export function crearContenedorDePrueba(
  sobreescrituras: Partial<EstadoContenedor> = {}
): EstadoContenedor {
  return { existe: false, volumenes: [], ...sobreescrituras };
}

export function crearServicioDePrueba(sobreescrituras: Partial<Servicio> = {}): Servicio {
  contador += 1;
  return {
    idServicio: contador,
    nombre: `servicio-prueba-${contador}`,
    descripcion: "Servicio de prueba",
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
    ...sobreescrituras,
  };
}

export function crearServicioDetalleDePrueba(
  sobreescrituras: Partial<ServicioDetalle> = {}
): ServicioDetalle {
  return {
    ...crearServicioDePrueba(),
    contenedor: crearContenedorDePrueba(),
    registros: [],
    ...sobreescrituras,
  };
}
