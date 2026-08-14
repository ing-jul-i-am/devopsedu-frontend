import type { Servicio, ServicioDetalle } from "@/tipos/servicio";

let contador = 0;

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
    registros: [],
    ...sobreescrituras,
  };
}
