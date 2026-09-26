import type { RecursoCantidad } from "@/infraestructura/errores-api";

export type EstadoServicio =
  | "configurado"
  | "desplegando"
  | "en_ejecucion"
  | "detenido"
  | "reiniciando"
  | "fallido"
  | "eliminado";

export interface Puerto {
  host: number;
  contenedor: number;
  protocolo: "tcp" | "udp";
}

export type TipoVolumen = "bind" | "volumen";

/** Forma que viaja en POST /servicios y PUT /servicios/:id/configuracion (3.5). */
export interface Volumen {
  origen: string;
  destino: string;
  modo: "ro" | "rw";
}

/**
 * Forma que devuelve el backend (3.1). `tipo` es derivado y de solo lectura: lo
 * calcula el backend a partir de `origen` y se ignora si se envia. Sirve para
 * orientar al estudiante mientras edita — para advertir que se perdera al
 * desplegar o eliminar se usa `EstadoContenedor`, no esto (contrato 3.9.1).
 */
export interface VolumenConTipo extends Volumen {
  tipo: TipoVolumen;
}

export interface ConfiguracionServicio {
  imagenDocker: string;
  cpuAsignado: number;
  memoriaAsignada: number;
  almacenamientoAsignado: number;
  puertos: Puerto[];
  variablesEntorno: Record<string, string>;
  volumenes: Volumen[];
}

export interface ConfiguracionServicioVigente extends Omit<
  ConfiguracionServicio,
  "volumenes"
> {
  volumenes: VolumenConTipo[];
}

/** Montaje real del contenedor consultado a Docker (DT-17 del backend, 3.6). */
export interface VolumenMontado {
  nombre: string;
  destino: string;
  anonimo: boolean;
}

export interface EstadoContenedor {
  existe: boolean;
  volumenes: VolumenMontado[];
}

export interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoServicio;
  fechaCreacion: string;
  configuracion: ConfiguracionServicioVigente | null;
}

export interface ServicioBasico {
  idServicio: number;
  nombre: string;
  estado: EstadoServicio;
}

/**
 * Respuesta de desplegar y eliminar (3.2). Informa que limpieza hubo que hacer
 * del contenedor anterior (DT-15 del backend).
 */
export interface ResultadoOperacion extends ServicioBasico {
  recreado: boolean;
  volumenesEliminados: string[];
  volumenesOmitidos: string[];
}

export interface RegistroDespliegue {
  idRegistro: number;
  fechaHora: string;
  operacion: "desplegar" | "detener" | "reiniciar" | "eliminar" | "monitorear";
  resultado: "exito" | "fallo";
  mensajeError: string | null;
  idServicio: number;
  idUsuario: number;
}

export interface ServicioDetalle extends Servicio {
  /**
   * `null` cuando no se pudo preguntar a Docker. No significa que no haya nada
   * que perder: obliga a advertir de forma generica (contrato 3.6).
   */
  contenedor: EstadoContenedor | null;
  registros: RegistroDespliegue[];
}

export interface ImagenDocker {
  nombre: string;
  descripcion: string;
}

export interface CapacidadServidor {
  total: RecursoCantidad;
  comprometido: RecursoCantidad;
  disponible: RecursoCantidad;
}

/**
 * Tabla de transiciones validas (docs/contrato-api.md seccion 3.9). Se usa
 * para deshabilitar en la UI las acciones no validas en vez de esperar el
 * 409 del backend.
 */
export const ESTADOS_ORIGEN_VALIDOS: Record<
  "desplegar" | "detener" | "reiniciar" | "eliminar",
  EstadoServicio[]
> = {
  desplegar: ["configurado", "detenido", "fallido"],
  detener: ["en_ejecucion"],
  reiniciar: ["detenido", "en_ejecucion", "fallido"],
  eliminar: [
    "configurado",
    "desplegando",
    "en_ejecucion",
    "detenido",
    "reiniciando",
    "fallido",
  ],
};
