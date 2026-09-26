// Insignia visual del progreso de un modulo dentro de la ruta del estudiante
// (RF-22, CU-13): verde = completado, amarillo = en progreso, gris = sin
// iniciar. Unica fuente de verdad para esta etiqueta y color en "Mi ruta" y
// en la vista de contenido de modulo.
import type { EstadoModuloRuta } from "@/tipos/aprendizaje";

const ETIQUETAS: Record<EstadoModuloRuta, string> = {
  completado: "Completado",
  en_progreso: "En progreso",
  sin_iniciar: "Sin iniciar",
};

const CLASES: Record<EstadoModuloRuta, string> = {
  completado: "bg-exito/10 text-exito",
  en_progreso: "bg-advertencia/10 text-advertencia",
  sin_iniciar: "bg-estado-eliminado/10 text-estado-eliminado",
};

interface Props {
  estado: EstadoModuloRuta;
}

export function InsigniaEstadoModulo({ estado }: Props) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-completo px-sm py-xs text-xs font-medium ${CLASES[estado]}`}
    >
      {ETIQUETAS[estado]}
    </span>
  );
}
