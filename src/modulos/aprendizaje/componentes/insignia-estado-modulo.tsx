// Insignia visual del progreso de un modulo dentro de la ruta del estudiante
// (RF-22, CU-13): verde = completado, amarillo = en progreso, gris = sin
// iniciar. Unica fuente de verdad para esta etiqueta y color en "Mi ruta" y
// en la vista de contenido de modulo. Usa los tonos suaves de DT-17, cuyo
// texto cumple el contraste AA (DT-18).
import type { EstadoModuloRuta } from "@/tipos/aprendizaje";

const ETIQUETAS: Record<EstadoModuloRuta, string> = {
  completado: "Completado",
  en_progreso: "En progreso",
  sin_iniciar: "Sin iniciar",
};

const CLASES: Record<EstadoModuloRuta, string> = {
  completado: "border-exito-borde bg-exito-suave text-exito-texto",
  en_progreso: "border-advertencia-borde bg-advertencia-suave text-advertencia-texto",
  sin_iniciar: "border-borde bg-fondo text-texto-secundario",
};

interface Props {
  estado: EstadoModuloRuta;
}

export function InsigniaEstadoModulo({ estado }: Props) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-completo border px-sm py-xs text-xs font-medium ${CLASES[estado]}`}
    >
      {ETIQUETAS[estado]}
    </span>
  );
}
