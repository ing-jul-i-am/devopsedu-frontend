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

export interface Volumen {
  origen: string;
  destino: string;
  modo: "ro" | "rw";
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

export interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoServicio;
  fechaCreacion: string;
  configuracion: ConfiguracionServicio | null;
}

export interface ServicioBasico {
  idServicio: number;
  nombre: string;
  estado: EstadoServicio;
}

export interface RegistroDespliegue {
  idRegistro: number;
  fechaHora: string;
  operacion: "desplegar" | "detener" | "reiniciar" | "eliminar";
  resultado: "exito" | "fallo";
  mensajeError: string | null;
  idServicio: number;
  idUsuario: number;
}

export interface ServicioDetalle extends Servicio {
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
export const ESTADOS_ORIGEN_VALIDOS: Record<"desplegar" | "detener" | "reiniciar" | "eliminar", EstadoServicio[]> = {
  desplegar: ["configurado", "detenido", "fallido"],
  detener: ["en_ejecucion"],
  reiniciar: ["detenido", "en_ejecucion", "fallido"],
  eliminar: ["configurado", "desplegando", "en_ejecucion", "detenido", "reiniciando", "fallido"],
};
