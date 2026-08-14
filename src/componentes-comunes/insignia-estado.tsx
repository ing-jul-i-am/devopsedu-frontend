// Insignia visual para los 7 estados del ciclo de vida de un Servicio
// (RF-17, seccion 4.2.14 del diseño). Unica fuente de verdad para su
// etiqueta y color en toda la interfaz (Servicios y Monitoreo).
import type { EstadoServicio } from "@/tipos/servicio";

const ETIQUETAS: Record<EstadoServicio, string> = {
  configurado: "Configurado",
  desplegando: "Desplegando",
  en_ejecucion: "En ejecucion",
  detenido: "Detenido",
  reiniciando: "Reiniciando",
  fallido: "Fallido",
  eliminado: "Eliminado",
};

const CLASES: Record<EstadoServicio, string> = {
  configurado: "bg-estado-configurado/10 text-estado-configurado",
  desplegando: "bg-estado-desplegando/10 text-estado-desplegando",
  en_ejecucion: "bg-estado-en-ejecucion/10 text-estado-en-ejecucion",
  detenido: "bg-estado-detenido/10 text-estado-detenido",
  reiniciando: "bg-estado-reiniciando/10 text-estado-reiniciando",
  fallido: "bg-estado-fallido/10 text-estado-fallido",
  eliminado: "bg-estado-eliminado/10 text-estado-eliminado",
};

interface Props {
  estado: EstadoServicio;
}

export function InsigniaEstado({ estado }: Props) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-completo px-sm py-xs text-xs font-medium ${CLASES[estado]}`}
    >
      {ETIQUETAS[estado]}
    </span>
  );
}
